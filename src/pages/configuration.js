import React from 'react';
import robotContext from '../context/robotContext'
import { Formik, Form, Field } from 'formik';
import MaterialTable from 'material-table';
import { Button, Fade, Paper } from '@material-ui/core';
import { ToastContainer } from 'react-toastify';
import PulseLoader from "react-spinners/PulseLoader";
import tableIcons from 'components/Material-UI-Icons';


import HydraMenu from 'components/HydraMenu';
import RedSwitch from 'components/RedSwitch';
import { showToast } from 'components/Toast';
import options from '../constants/options'

import api from 'services/api';

import 'global.css';
import './configuration.css';

import background from 'background.png';
import get from 'lodash/get'
import moment from 'moment'

import robot from 'robot.png'
import results from 'results.png'
import soros from 'soros.png'
import general from 'general.png'

export default class Configuration extends React.Component {
	static contextType = robotContext

	constructor(props) {
		super(props)
		this.state = {
			activeTab: "1",
			plays: [],
			isMartingale: true,
			isSoros: false,
			martingaleCoef: 2.2,
			martingaleNum: 1,
			sorosNum: 3,
			stopLoss: 50,
			stopGain: 50,
			initialValue: 5,
			delayOperation: 0,
			isPlaying: false,
			availablePlays: options,
			predict: '',
			addedOption: '',
			timeUntilWinFetch: 0,
			resultsObj: {},
			shouldFetchResults: false
		}
		this.isPlaying = false
		this.balance = 0
	}

	makeThePlays = async () => {
		const { signal: { signals } } = this.context

		const signalsByplayTime = {}


		signals.forEach(signal => {
			const unixDate = moment(signal.date).unix();

			if (signalsByplayTime[unixDate]) {
				signalsByplayTime[unixDate].push(signal)
			} else {
				signalsByplayTime[unixDate] = [signal]
			}
		})



		const now = moment().unix();
		const tomorrow = moment().endOf('day').unix()

		for (let playSetUnixTime in signalsByplayTime) {
			if (playSetUnixTime > now && playSetUnixTime < tomorrow) {
				const waitTime = Math.round(playSetUnixTime - now) * 1000;
				console.log({ waitTime })
				setTimeout(async () => {
					const receivedPlay = this.makePlayFactory(signalsByplayTime[playSetUnixTime]);
					await receivedPlay();
				}, waitTime)
			}
		}

		console.log({ signalsByplayTime })
	}

	start = async (plays, hand_soros, result, profit, agregated_value, currency, type, duration_time, error, num_martingale, num_soros) => {
		const {
			user: {
				userReducer: {
					userId,
					email,
					balance,
					isRealAccount,
					password,
				}
			},
		} = this.context

		const { martingaleCoef, delayOperation, martingaleDelay, isMartingale, isSoros, martingaleNum, sorosNum } = this.state;
		try {
			const res = await api.post('/start', {
				email: email
				, password: password
				, mode: isRealAccount
				, user_group_id: userId
				, martingale_coef: martingaleCoef
				, num_martingale
				, num_soros
				, plays: plays.map(play => ({...play, initial_value: play.agregated_value}))
				, delay_operation: delayOperation
				, delay_martingale: martingaleDelay
				, is_martingale: isMartingale
				, is_soros: isSoros
				, hand_soros
				, result
				, profit
				, agregated_value
				, currency
				, type
				, duration_time
				, error
				, num_martingale_original: martingaleNum
				, num_soros_original: sorosNum
			})
			return res.data.id
		} catch (err) {
			showToast({ type: 'error', message: `${currency} - ` + get(err, 'response.data.message', 'ocorreu um erro com a jogada') })
			throw new Error()
		}
	}

	getSignals = async () => {
		const {
			signal
		} = this.context

		try {
			const { data: { records } } = await api.get('/indexSignal')
			const futureSignals = records.map(record => ({ ...record, date: `${record.date}-0300` }))
			signal.setSignals(futureSignals)
		} catch (err) {
			showToast({ type: 'error', message: 'Ocorreu um erro ao baixar os sinais' })
		}
	}

	componentDidMount = async () => {
		await this.getSignals()
	}

	componentDidUpdate = async (prevProps, prevState) => {
		if (this.state.shouldFetchResults && !prevState.shouldFetchResults) {
			const timeUntilWinFetch = await this.getLastResolution()
			this.setState({ timeUntilWinFetch })
			setTimeout(async () => {
				await this.getResultsObj()
			}, timeUntilWinFetch)
		}
	}

	getResultsObj = async () => {
		await new Promise(resolve => setTimeout(resolve, 1000))

		let resultsObj = await this.getLastWins()

		while (resultsObj.open_options.length) {
			await new Promise(resolve => setTimeout(resolve, 1000))
			resultsObj = await this.getLastWins()
		}


		return resultsObj
	}

	getLastWins = async () => {
		const {
			user: {
				userReducer: {
					userId,
					email,
					balance,
					isRealAccount,
					password
				}
			}
		} = this.context

		const lastWins = await api.post('/check_win', {
			email: email,
			password: password,
			mode: isRealAccount,
			user_group_id: userId
		});

		return lastWins.data.msg
	}

	getLastResolution = async () => {
		const lastPlays = await this.getLastWins()
		let biggestResolutionTime = 0;

		if (!lastPlays.open_options.length) {
			return 60000
		}

		for (let i = 0; i < lastPlays.open_options.length; i++) {
			if (lastPlays.open_options[i].exp_time > biggestResolutionTime) {
				biggestResolutionTime = lastPlays.open_options[i].exp_time
			}
		}


		const currentTimeMs = Math.round(new Date().getTime() / 1000)

		const timeUntilResolution = (biggestResolutionTime - currentTimeMs) * 1000


		return timeUntilResolution + 2000
	}

	getTimeUntilResolution = async id => {
		const lastPlays = await this.getLastWins()
		const currentPlay = lastPlays.open_options.find(play => play.id === id)

		if (!currentPlay) {
			return 60000
		}

		console.log({ currentPlay })


		const currentTimeMs = Math.round(new Date().getTime() / 1000)

		const timeUntilResolution = (currentPlay.exp_time - currentTimeMs) * 1000

		return timeUntilResolution + 2000
	}

	checkStop = (value, add) => {
		let balanceValue = this.balance
		balanceValue += add
			? value
			: -value


		console.log({ balanceValue })

		if (balanceValue > 0) {
			if (balanceValue >= this.state.stopGain) {
				showToast({ type: 'success', message: 'Você atingiu o limite de ganho' })
				this.balance = 0
				this.isPlaying = false
				this.setState({ isPlaying: false })
			}
			return
		}

		if (Math.abs(balanceValue) >= this.state.stopLoss) {
			showToast({ type: 'error', message: 'Você atingiu o limite de perda' })
			this.balance = 0
			this.isPlaying = false
			this.setState({ isPlaying: false })
		}
	}


	checkWin = async playsArray => {
		const { initialValue, martingaleCoef, isSoros } = this.state;

		let resultsObj = {};
		let retryTime = 1100;


		while (!resultsObj.closed_options) {
			resultsObj = await this.getResultsObj()
			if (!resultsObj.closed_options) {
				retryTime = await this.getLastResolution()
			}
			await new Promise(resolve => setTimeout(resolve, retryTime))
		}

		console.log('eu passo do while do checkwin ?')
		console.log({ playsArray, resultsObj })

		const updatedPlaysArray = playsArray.map(play => {
			const targetPlay = resultsObj.closed_options.find(option => option.id.includes(play.id))
			console.log({ targetPlay })

			if (!targetPlay) {
				return { ...play, tries: 0 }
			}

			const { amount, win_amount } = targetPlay

			if (targetPlay.win === 'win') {
				const addedAmount = win_amount - amount
				this.checkStop(addedAmount, true)
				this.balance += addedAmount

				const agregated_value = isSoros
					? play.agregated_value += play.agregated_value * 0.8
					: initialValue

				return { ...play, agregated_value }
			}

			this.checkStop(amount, false)
			this.balance -= amount;
			const agregated_value = isSoros
				? initialValue
				: play.agregated_value * martingaleCoef
			return { ...play, tries: play.tries - 1, agregated_value }
		})

		console.log('eu sai do map', { updatedPlaysArray })

		return updatedPlaysArray
	}


	makePlayFactory = (playsArray) => {
		const { isMartingale, martingaleNum, sorosNum, initialValue } = this.state

		let data = playsArray.map(play => ({
			...play,
			tries: isMartingale ? martingaleNum : sorosNum,
			agregated_value: initialValue,
			expiration: parseInt(play.duration_time.split(' ')[0])
		}))

		return async () => {
			while (this.isPlaying && data.length > 0) {
				data = data.filter(play => play.tries > 0)

				console.log({ ['this.isPlaying']: this.isPlaying })
				try {
					const ids = await this.start(data, 0, null, null, 0, null, null, null, false, martingaleNum, sorosNum)
					for (let i = 0; i < ids.length; i++) {
						data[i].id = ids[i]
					}
				} catch (err) {
					console.log(`${'currency'} erro`)
					/* tries = 0; */
					break;
				}

				this.setState({ shouldFetchResults: true, resultsObj: {} })
				console.log('chegou no should fetch results')
				while (!this.state.timeUntilWinFetch) {
					await new Promise(resolve => setTimeout(resolve, 500))
					console.log('ta no while')
				}

				console.log(`esperando o timeout - ${this.state.timeUntilWinFetch}`)

				await new Promise(resolve => setTimeout(resolve, this.state.timeUntilWinFetch))
				console.log('passei do timeout agora é só esperar o async')
				data = await this.checkWin(data)

				console.log({ data })
			}
		}
	}

	handlePlay = (value) => {
		this.setState({ isPlaying: value })
		this.isPlaying = value
		if (value) {
			this.makeThePlays()
		}
	};

	handleSelectPlayType = event => {
		const { isSoros, isMartingale } = this.state
		if (event.target.name === 'soros') {
			if (!isSoros) {
				this.setState({ isSoros: true, isMartingale: false })
			}
		}
		else {
			if (!isMartingale) {
				this.setState({ isSoros: false, isMartingale: true })
			}
		}
	}

	handleAddOption = (e) => {
		e.preventDefault()
		const { addedOption, predict, plays, availablePlays } = this.state;

		if (!addedOption) {
			showToast({ type: "error", message: "Você precisa selecionar uma moeda para adicionar uma jogada" })
			return;
		}
		if (!predict) {
			showToast({ type: "error", message: "Você precisa selecionar uma previsão para adicionar uma jogada" })
			return;
		}

		const newAvailablePlays = availablePlays.filter(play => play.currency != addedOption)

		this.setState({
			plays: [...plays, { currency: addedOption, predict }],
			addedOption: '',
			predict: '',
			availablePlays: newAvailablePlays
		})
	}

	handleRemoveOption = currency => {
		const { plays, availablePlays } = this.state;

		this.setState({
			plays: plays.filter(play => play.currency !== currency),
			availablePlays: [...availablePlays, { currency }]
		})
	}

	render() {
		const color = '#fff'
		const fontSize = 20
		const width = 72
		const height = 72
		const border = '2px solid #fff'
		const borderRadiusActive = 25
		const borderRadius = 40
		const backgroundColorActive = '#61541e'

		const { props } = this;
		
		const {
			user: {
				userReducer: {
					userId,
					balance,
				}
			},
			signal: {
				signals
			}
		} = this.context

		const {
			activeTab,
			martingaleCoef,
			martingaleNum,
			sorosNum,
			stopLoss,
			stopGain,
			initialValue,
			delayOperation,
			martingaleDelay,
			isMartingale,
			isSoros
		} = this.state;

		console.log({ context: this.context })
		return (
			<>
				<img src={background} alt="background" className="bg-image" />
				<div className="App">
					<ToastContainer autoClose={false} />
					<div style={{ display: 'flex' }}>
						<HydraMenu id={props.match.params.id} email={props.match.params.email} password={props.match.params.password} mode={props.match.params.mode} balance={balance} />
						<div style={{ paddingTop: 20, width: '25%' }}>
							<h3>
								{`Valor da Banca: ${balance}`}
							</h3>
						</div>
					</div>
					<div style={{ marginTop: 12, display: 'flex' }}>
						<ul style={{ marginLeft: 15, textAlign: 'left', wiidth: '25vh' }}>
							<li className="icon-sytle">
								{
									activeTab === "3"
										? <Button className="button-menu" style={{ color: color, fontSize: fontSize, width: width, height: height, border: border, borderRadius: borderRadiusActive, backgroundColor: backgroundColorActive }} variant="outlined" onClick={() => this.setState({ activeTab: "3" })}><img className="icon-sizer" src={general} /></Button>
										: <Button className="button-menu" style={{ color: color, fontSize: fontSize, width: width, height: height, border: border, borderRadius: borderRadius }} variant="outlined" onClick={() => this.setState({ activeTab: "3" })}><img className="icon-sizer" src={general} /></Button>
								}
								<span className="desc-text">Geral</span>
							</li>
							<li className="icon-sytle">
								{
									activeTab === "1"
										? <Button className="button-menu" style={{ color: color, fontSize: fontSize, width: width, height: height, border: border, borderRadius: borderRadiusActive, backgroundColor: backgroundColorActive }} variant="outlined" onClick={() => this.setState({ activeTab: "1" })}>
											<img className="icon-sizer" src={robot} />
										</Button>
										: <Button className="button-menu" style={{ color: color, fontSize: fontSize, width: width, height: height, border: border, borderRadius: borderRadius }} variant="outlined" onClick={() => this.setState({ activeTab: "1" })}><img className="icon-sizer" src={robot} /></Button>
								}
								<span className="desc-text">Martingale</span>
							</li>
							<li className="icon-sytle">
								{
									activeTab === "2"
										? <Button className="button-menu" style={{ color: color, fontSize: fontSize, width: width, height: height, border: border, borderRadius: borderRadiusActive, backgroundColor: backgroundColorActive }} variant="outlined" onClick={() => this.setState({ activeTab: "2" })}><img className="icon-sizer" src={soros} /></Button>
										: <Button className="button-menu" style={{ color: color, fontSize: fontSize, width: width, height: height, border: border, borderRadius: borderRadius }} variant="outlined" onClick={() => this.setState({ activeTab: "2" })}><img className="icon-sizer" src={soros} /></Button>
								}
								<span className="desc-text">Soros</span>
							</li>
							<li className="icon-sytle">
								{
									activeTab === "4"
										? <Button className="button-menu" style={{ color: color, fontSize: fontSize, width: width, height: height, border: border, borderRadius: borderRadiusActive, backgroundColor: backgroundColorActive }} variant="outlined" onClick={() => this.setState({ activeTab: "4" })}><img className="icon-sizer" src={results} /></Button>
										: <Button className="button-menu" style={{ color: color, fontSize: fontSize, width: width, height: height, border: border, borderRadius: borderRadius }} variant="outlined" onClick={() => this.setState({ activeTab: "4" })}><img className="icon-sizer" src={results} /></Button>
								}
								<span className="desc-text">Resultados</span>
							</li>
						</ul>
						<div className="App-center app-config bg-transparent">
							<Formik
								initialValues={{
									martingale_coef: martingaleCoef,
									num_martingale: martingaleNum,
									num_soros: sorosNum,
									stop_loss: stopLoss,
									stop_gain: stopGain,
									initial_value: initialValue,
									delay_operation: delayOperation,
									delay_martingale: martingaleDelay,
									is_martingale: isMartingale,
									is_soros: isSoros
								}}
								onSubmit={(values, { setSubmitting }) => {
									setSubmitting(true)
									const {
										martingale_coef,
										num_martingale,
										num_soros,
										stop_loss,
										stop_gain,
										initial_value,
										delay_operation,
										delay_martingale,
										is_martingale,
										is_soros,
									} = values

									api.post('/saveConfiguration', {
										martingale_coef
										, num_martingale, num_soros
										, stop_loss
										, stop_gain
										, initial_value
										, delay_operation
										, delay_martingale
										, is_martingale
										, is_soros
										, email: props.match.params.email
										, user_id: userId
									}).then(res => {
										showToast({ type: res.data.type, message: res.data.message })
										setSubmitting(false)
									})
								}}
							>
								{({ isSubmitting }) => (
									<>
										<Form className="form">
											<div className="overflow-form">
												<Fade in={activeTab === "1"} style={{ backgroundColor: "transparent", display: activeTab === "1" ? 'block' : 'none' }}>
													<Paper>
														<h2 className="h2">Martingale</h2>
														<br></br>
														<div style={{ display: 'flex', justifyContent: 'center' }}>
															<span className="label" style={{ width: 210, color: '#E1E1D6' }}>Coeficiente de Martingale</span>
															<Field disabled={this.isPlaying} value={martingaleCoef} onChange={e => this.setState({ martingaleCoef: e.target.value })} className="field field-configuration bg-transparent" type="number" name="martingale_coef" />
														</div>
														<div style={{ display: 'flex', justifyContent: 'center' }}>
															<span className="label" style={{ width: 210, color: '#E1E1D6' }}>Número de entradas</span>
															<Field disabled={this.isPlaying} value={martingaleNum} onChange={e => this.setState({ martingaleNum: e.target.value })} className="field field-configuration bg-transparent" type="number" name="num_martingale" min={1} />
														</div>
													</Paper>
												</Fade>
												<Fade className="fade" in={activeTab === "2"} style={{ backgroundColor: "transparent", display: activeTab === "2" ? 'block' : 'none' }}>
													<Paper>
														<h2 className="h2">Soros</h2>
														<br></br>
														<div style={{ display: 'flex', justifyContent: 'center' }}>
															<span className="label" style={{ width: 170, color: '#E1E1D6' }}>Número de entradas</span>
															<Field disabled={this.isPlaying} value={sorosNum} onChange={e => this.setState({ sorosNum: e.target.value })} className="field field-configuration bg-transparent" type="number" name="num_soros" min={1} />
														</div>
													</Paper>
												</Fade>
												<Fade className="fade" in={activeTab === "3"} style={{ backgroundColor: "transparent", display: activeTab === "3" ? 'block' : 'none' }}>
													<Paper>
														<h2 className="h2">Configurações Gerais</h2>
														<br></br>
														<div style={{ display: 'flex', justifyContent: 'center' }}>
															<span className="label" style={{ width: 155, color: '#E1E1D6' }}>Stop Loss</span>
															<Field disabled={this.isPlaying} value={stopLoss} onChange={e => this.setState({ stopLoss: e.target.value })} className="field field-configuration bg-transparent" type="number" name="stop_loss" min={0} />
														</div>
														<div style={{ display: 'flex', justifyContent: 'center' }}>
															<span className="label" style={{ width: 155, color: '#E1E1D6' }}>Stop Gain</span>
															<Field disabled={this.isPlaying} value={stopGain} onChange={e => this.setState({ stopGain: e.target.value })} className="field field-configuration bg-transparent" type="number" name="stop_gain" min={1} />
														</div>
														<div style={{ display: 'flex', justifyContent: 'center' }}>
															<span className="label" style={{ width: 155, color: '#E1E1D6' }}>Valor inicial</span>
															<Field disabled={this.isPlaying} value={initialValue} onChange={e => this.setState({ initialValue: e.target.value })} className="field field-configuration bg-transparent" type="number" name="initial_value" />
														</div>
														<div style={{ display: 'flex', justifyContent: 'center' }}>
															<RedSwitch name="martingale" disabled={this.isPlaying} onChange={this.handleSelectPlayType} checked={isMartingale} />
															<span className="label" style={{ color: '#E1E1D6' }}>Usar Martingale</span>
														</div>
														<div style={{ display: 'flex', justifyContent: 'center' }}>
															<RedSwitch name="soros" disabled={this.isPlaying} onChange={this.handleSelectPlayType} checked={isSoros} />
															<span className="label" style={{ color: '#E1E1D6' }}>Usar Soros</span>
														</div>
													</Paper>
												</Fade>
												<Fade className="fade" in={activeTab === "4"} style={{ backgroundColor: "transparent", display: activeTab === "4" ? 'block' : 'none' }}>
													<Paper style={{ overflowY: 'auto' }}>
														<h2 style={{ color: 'white' }}>Resultados</h2>
														<MaterialTable
															title="Lista de Sinais"
															icons={tableIcons}
															style={{ backgroundColor: 'transparent', color: '#E1E1D6' }}
															columns={[
																{ title: 'Id', field: 'config_signs_list_id' },
																{ title: 'Data', field: 'date' },
																{ title: 'Hora', field: 'hour' },
																{ title: 'Moeda', field: 'currency' },
																{ title: 'Tipo', field: 'type' },
															]}
															data={signals}
														/>
													</Paper>
												</Fade>
											</div>
											<div style={{ height: 65, display: 'flex' }}>
												<div style={{ width: '50%' }}>
												</div>
												<div style={{ width: '50%', margin: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
													{(
														this.isPlaying &&
														<>
															<span className="label">Operando</span>
															<div className="label" style={{ marginLeft: 5, marginRight: 5 }}>
																<PulseLoader
																	size={8}
																	color={"#fff"}
																/>
															</div>
														</>
													)}
													<RedSwitch onChange={(e) => this.handlePlay(e.target.checked)} checked={this.state.isPlaying} />
													<span className="label">Play</span>
												</div>
											</div>
										</Form>
									</>
								)}
							</Formik>
						</div>
					</div>
				</div>
			</>
		)
	}
}

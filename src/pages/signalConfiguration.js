import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MaterialTable from 'material-table';
import { Trash2 } from "react-feather";
import moment from 'moment';
import { ToastContainer } from 'react-toastify';
import ClipLoader from "react-spinners/ClipLoader";

import HydraMenu from 'components/HydraMenu';
import tableIcons from 'components/Material-UI-Icons';
import { showToast } from 'components/Toast';
import RedSwitchFormik from 'components/RedSwitchFormik';

import api from 'services/api';

import 'global.css';
import './signalConfiguration.css';

/* Dialog */
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Select from '@material-ui/core/Select';
/* End Dialog */

//const override = 

export default function SignalConfiguration(props) {
	const [signalList, setSignalList] = useState([]);
	const [openDelete, setOpenDelete] = useState(false);
	const [openDeleteAll, setOpenDeleteAll] = useState(false);
	const [signalDelete, setSignalDelete] = useState('');

	async function loadSignalList() {
		let signals = await api.get('/indexSignal')
		const records = signals.data.records
		
		signals.data.records.forEach(r => r.date = moment(r.date).format("DD/MM/YYYY"))
		setSignalList(records)
	}

	useEffect(() => {
		showToast({ message: 'Carregando sinais...' })
		loadSignalList()
	}, [])

	const handleDelete = async (signalId) => {
		const res = await api.delete(`/deleteSignal?signal_id=${signalId}`)

		if (res.data.type === 'success') {
			let localSignals = signalList
			localSignals = localSignals.filter(element => element.config_signs_list_id !== signalId)
			setSignalList(localSignals)
		}
		showToast({ type: res.data.type, message: res.data.message })
	}

	const handleDeleteAll = async () => {
		const res = await api.delete('/deleteAllSignal')

		if (res.data.type === 'success') {
			let localSignals = []
			setSignalList(localSignals)
		}
		showToast({ type: res.data.type, message: res.data.message })
	}

	const handleCloseDelete = (signalId) => {
		setOpenDelete(false)
		setOpenDeleteAll(false)
		if (signalId === 'all')
			handleDeleteAll()
		else if (!!signalId)
			handleDelete(signalId)
	}

	const handleSignalDelete = (signalId) => {
		if (signalId === 'all')
			setOpenDeleteAll(true)
		else
			setOpenDelete(true);
		setSignalDelete(signalId)
	}

	return (
		<div className="App">
			<ToastContainer />
			<HydraMenu id={props.match.params.id} email={props.match.params.email} password={props.match.params.password} mode={props.match.params.mode} balance={props.match.params.balance} />
			<div className="App-center">
				<Formik
					initialValues={{
						date: '',
						hour: '',
						duration_time: 1,
						currency: '',
						otc: false,
						type: 'CALL',
					}}
					onSubmit={(values, { setSubmitting }) => {
						setSubmitting(true)
						const {
							date
							, hour
							, duration_time
							, otc
							, currency
							, type
						} = values
						const saveSignal = async () => {
							console.log(values)
							console.log({date
								, hour
								, duration_time
								, otc
								, currency
								, type})
							api.post('/saveSignal', {
								date
								, hour
								, duration_time
								, otc
								, currency: currency.toUpperCase()
								, type: type.toUpperCase()
							}).then(res => {
								setSubmitting(false)
								showToast({ type: res.data.type, message: res.data.message })
								if (res.data.type === 'success')
									loadSignalList()
							})
						}
						saveSignal()
					}}
				>
					{({ isSubmitting }) => (
						<Form className="form form-login">
							<div style={{ display: 'flex', flexWrap: 'wrap', width: '95vh' }}>
								<Field className="field date-field bg-color" type="date" name="date" />
								<Field className="field time-field bg-color" type="time" name="hour" />
								<Field className="field bg-color" as="select" name="duration_time" style={{ width: '90px' }} >
									<option value="1">1</option>
									<option value="5">5</option>
									<option value="15">15</option>
								</Field>
								{/* <FormControlLabel
									label="OTC?"
									control={<Field component={RedSwitchFormik} name="otc" />}
								/> */}
								<Field className="field generic-field bg-color" type="text" name="currency" placeholder="Ex: EURUSD" maxLength={6} />
								<Field className="field generic-field bg-color" as="select" name="type" style={{ width: '110px' }} >
									<option value="CALL">CALL</option>
									<option value="PUT">PUT</option>
								</Field>
								<button
									className="field submit"
									type="submit"
									disabled={isSubmitting}
								>
									Salvar
									{(
										isSubmitting &&
										<ClipLoader
											css={"margin-left: 5px;"}
											size={15}
											color={"#fff"}
										/>
									)}
								</button>

								<div style={{ display: 'flex' }}>
									<Trash2 className="trash-hover" onClick={() => handleSignalDelete('all')} style={{ margin: 'auto' }} />
									<Dialog
										open={openDeleteAll}
										onClose={() => handleCloseDelete(null)}
										aria-labelledby="alert-dialog-title"
										aria-describedby="alert-dialog-description"
									>
										<DialogTitle id="alert-dialog-title">{"Exclusão de Sinal"}</DialogTitle>
										<DialogContent>
											<DialogContentText id="alert-dialog-description">
												Deseja realmente excluir todos os sinais?
          						</DialogContentText>
										</DialogContent>
										<DialogActions>
											<Button onClick={() => handleCloseDelete(null)} color="primary">
												Cancelar
          						</Button>
											<Button onClick={() => handleCloseDelete(signalDelete)} color="primary" autoFocus>
												Confirmar
          					</Button>
										</DialogActions>
									</Dialog>
								</div>
							</div>
						</Form>
					)}
				</Formik>
				<div className="table">
					<MaterialTable
						title="Lista de Sinais"
						icons={tableIcons}
						style={{ backgroundColor: 'transparent', color: '#E1E1D6' }}
						columns={[
							{ title: 'Id', field: 'config_signs_list_id' },
							{ title: 'Data', field: 'date' },
							{ title: 'Hora', field: 'hour' },
							{ title: 'Tempo de Duração', field: 'duration_time' },
							{ title: 'Moeda', field: 'currency' },
							{ title: 'Tipo', field: 'type' },
							{
								render: rowData => (
									<>
										<Trash2 className="trash-hover" onClick={() => handleSignalDelete(rowData.config_signs_list_id)} />
										<Dialog
											open={openDelete}
											onClose={() => handleCloseDelete(null)}
											aria-labelledby="alert-dialog-title"
											aria-describedby="alert-dialog-description"
										>
											<DialogTitle id="alert-dialog-title">{"Exclusão de Sinal"}</DialogTitle>
											<DialogContent>
												<DialogContentText id="alert-dialog-description">
													Deseja realmente excluir este sinal?
          						</DialogContentText>
											</DialogContent>
											<DialogActions>
												<Button onClick={() => handleCloseDelete(null)} color="primary">
													Cancelar
          						</Button>
												<Button onClick={() => handleCloseDelete(signalDelete)} color="primary" autoFocus>
													Confirmar
          					</Button>
											</DialogActions>
										</Dialog>
									</>
								)
							}
						]}
						data={signalList}
					/>
				</div>
			</div>
		</div >
	)
}
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import MaterialTable from 'material-table';
import { Trash2 } from "react-feather";
import { ToastContainer } from 'react-toastify';
import ClipLoader from "react-spinners/ClipLoader";

import { showToast } from 'components/Toast';

import HydraMenu from 'components/HydraMenu';
import RedSwitch from 'components/RedSwitch';
import tableIcons from 'components/Material-UI-Icons';

import api from 'services/api';

import 'global.css';
import './adminSettings.css';

/* Dialog */
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
/* End Dialog */

export default function AdminSettings(props) {
	const [statusSystem, setStatusSystem] = useState(false);
	const [emailList, setEmailList] = useState([]);
	const [openDelete, setOpenDelete] = useState(false);
	const [openStatus, setOpenStatus] = useState(false);
	const [emailStatus, setEmailStatus] = useState('');
	const [emailDelete, setEmailDelete] = useState('');

	async function loadList() {
		let emails = await api.get('/indexUsers?user_group_id=3')
		setEmailList(emails.data.users)
	}

	async function loadSettings() {
		let statusSystem = await api.get('/indexSettings')
		const locked = statusSystem.data.settings.locked_by_admin
		setStatusSystem(locked)
	}

	useEffect(() => {
		showToast({ message: 'Carregando usuários...' })
		loadList()
		loadSettings()
	}, [])

	const handleStatusSystem = async () => {
		setStatusSystem(!statusSystem)

		const res = await api.patch('/updateAdmin')
		if (res.data.settings.type === 'error') {
			setStatusSystem(!statusSystem)
		}

		showToast({ type: res.data.settings.type, message: res.data.settings.message })
	}

	const handleDelete = async (email) => {
		console.log('manoooooo', {email})
		const res = await api.delete(`/deleteUser?email=${email}`)

		if (res.data.type === 'success') {
			let localEmails = emailList
			localEmails = localEmails.filter(element => element.email !== email)
			setEmailList(localEmails)
		}
		showToast({ type: res.data.type, message: res.data.message })
	}

	const handleCloseDelete = (email) => {
		setOpenDelete(false)
		if (!!email)
			handleDelete(email)
	}

	const handleEmailDelete = (email) => {
		setOpenDelete(true);
		setEmailDelete(email)
	}

	const setStatus = (localEmails, emailUpdated, email) => {
		localEmails = localEmails.filter(element => element.email !== email)
		emailUpdated[0].active = !emailUpdated[0].active
		localEmails.push(emailUpdated[0])
		setEmailList(localEmails)
	}

	const handleStatus = async (email) => {
		let localEmails = emailList
		let emailUpdated = localEmails.filter(element => element.email === email)
		setStatus(localEmails, emailUpdated, email)

		const res = await api.patch(`/setUserStatus?email=${email}`)
		if (res.data.type === 'error') {
			setStatus(localEmails, emailUpdated, email)
		}
		showToast({ type: res.data.type, message: res.data.message })
	}

	const handleCloseStatus = (email) => {
		setOpenStatus(false);
		if (!!email)
			handleStatus(email)
	}

	const handleEmailStatus = (email) => {
		setOpenStatus(true);
		setEmailStatus(email)
	}

	return (
		<div className="App">
			<ToastContainer />
			<HydraMenu id={props.match.params.id} email={props.match.params.email} password={props.match.params.password} mode={props.match.params.mode} balance={props.match.params.balance} />
			<div className="App-center">
				<Formik
					initialValues={{
						email: ''
					}}
					validate={values => {
						const errors = {};
						if (
							!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
						) {
							errors.email = 'Endereço de E-mail inválido';
						}
						return errors;
					}}
					onSubmit={(values, { setSubmitting }) => {
						setSubmitting(true)
						const { email } = values
						const saveConfiguration = async () => {
							api.post('/createUser', {
								email,
								password: null,
								user_group_id: 3
							}).then(res => {
								values.email = ''
								setSubmitting(false)
								showToast({ type: res.data.type, message: res.data.message })
								console.log(res)
								if (res.data.type === 'success')
									loadList()
							})
						}

						if (!!email)
							saveConfiguration()
					}}
				>
					{({ isSubmitting }) => (
						<>
							<Form className="form">
								<div style={{ display: 'flex' }}>
									<Field className="field bg-color" type="text" name="email" placeholder="E-mail" />
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
								</div>
								<ErrorMessage className="error" name="email" component="div" style={{ textAlign: 'left' }} />
							</Form>
						</>
					)}
				</Formik>
				<div style={{ width: '78%', textAlign: 'left' }}>
					<span style={{ textSize: 20 }}>Bloquear/Desbloquear Sistema</span><RedSwitch onChange={handleStatusSystem} checked={statusSystem} />
				</div>
				<div>
					<MaterialTable
						title="Administradores"
						icons={tableIcons}
						style={{ backgroundColor: '#202020', color: '#E1E1D6' }}
						columns={[
							{ title: 'Id', field: 'user_id' },
							{ title: 'E-mail', field: 'email' },
							{
								title: 'Status',
								field: 'active',
								filtering: false,
								render: rowData => (
									<>
										<RedSwitch onClick={() => handleEmailStatus(rowData.email)} checked={rowData.active} />
										<Dialog
											open={openStatus}
											onClose={() => handleCloseStatus(null)}
											aria-labelledby="alert-dialog-title"
											aria-describedby="alert-dialog-description"
										>
											<DialogTitle id="alert-dialog-title">{"Ativação/Inativação de Usuário"}</DialogTitle>
											<DialogContent>
												<DialogContentText id="alert-dialog-description">
													Deseja realmente alterar o status deste usuário?
          						</DialogContentText>
											</DialogContent>
											<DialogActions>
												<Button onClick={() => handleCloseStatus(null)} color="error">
													Cancelar
          						</Button>
												<Button onClick={() => handleCloseStatus(emailStatus)} color="primary" autoFocus>
													Confirmar
          					</Button>
											</DialogActions>
										</Dialog>
									</>
								)
							},
							{
								filtering: false,
								render: rowData => (
									<>
										<Trash2 className="trash-hover" onClick={() => handleEmailDelete(rowData.email)} />
										<Dialog
											open={openDelete}
											onClose={() => handleCloseDelete(null)}
											aria-labelledby="alert-dialog-title"
											aria-describedby="alert-dialog-description"
										>
											<DialogTitle id="alert-dialog-title">{"Exclusão de Usuário"}</DialogTitle>
											<DialogContent>
												<DialogContentText id="alert-dialog-description">
													Deseja realmente excluir este usuário?
          						</DialogContentText>
											</DialogContent>
											<DialogActions>
												<Button onClick={() => handleCloseDelete(null)} color="primary">
													Cancelar
          						</Button>
												<Button onClick={() => handleCloseDelete(emailDelete)} color="primary" autoFocus>
													Confirmar
          					</Button>
											</DialogActions>
										</Dialog>
									</>
								)
							}
						]}
						data={emailList}
						options={{
							filtering: true
						}}
					/>
				</div>
			</div>
		</div>
	)
}
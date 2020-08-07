import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { ToastContainer } from 'react-toastify';
import ClipLoader from "react-spinners/ClipLoader";

import RedSwitchFormik from 'components/RedSwitchFormik';
import { showToast } from 'components/Toast';

import api from 'services/api';
import robotContext from '../context/robotContext'
import actions from '../actionTypes'

import logo from 'logo.png';

import 'global.css';
import './login.css';

import background from 'background.jpg';

export default function Login() {
	const history = useHistory();
	const { user: { userDispatcher } } = useContext(robotContext);
	const ctx = useContext(robotContext);


	const handleSubmit = async (values, { setSubmitting }) => {
		setSubmitting(true)
		const { email, password, mode } = values
		const {
			data: { id, type, balance, message }
		} = await api.post('/login', { email, password, mode});
		
		if(type === 'success'){
			history.push(`/configuration`);
			userDispatcher({type: actions.USER_LOGIN_SUCCESS , value: {
				email,
				userId: id,
				password,
				isRealAccount: mode,
				balance
			}})
		}
		else if ( type === 'error'){
			showToast({ type, message: message })
		}
		else if (id === 1){
			history.push(`/systemSettings/${id}`);
		}
	}


	return (
		<>
			<img src={background} alt="background" className="bg-image" />
			<div className="App">
				<ToastContainer />
				<div className="App-center center-login bg-transparent">
					<img src={logo} alt="logo" className="App-logo" />
					<Formik
						initialValues={{ email: '', password: '', mode: false }}
						validate={values => {
							const errors = {};
							if (
								!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
							) {
								errors.email = 'Endereço de E-mail inválido';
							}
							return errors;
						}}
						onSubmit={handleSubmit}
					>
						{({ isSubmitting }) => (
							<Form className="form form-login">
								<Field className="field bg-transparent" type="email" name="email" placeholder="E-mail" />
								<ErrorMessage className="error" name="email" component="div" />
								<Field className="field bg-transparent" type="password" name="password" placeholder="Senha" />
								<ErrorMessage className="error" name="password" component="div" />
								<FormControlLabel
									control={<Field component={RedSwitchFormik} name="mode" />}
									label="Conta Real"
								/>
								<button
									className="field submit"
									type="submit"
									disabled={isSubmitting}
								>
									Entrar
									{(
										isSubmitting &&
										<ClipLoader
											css={"margin-left: 5px;"}
											size={15}
											color={"#fff"}
										/>
									)}
								</button>
							</Form>
						)}
					</Formik>
				</div>
			</div>
		</>
	);
}

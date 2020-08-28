import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import * as Icon from '@material-ui/icons';
import robotContext from '../context/robotContext'

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
/* End Dialog */


import 'global.css';

function HydraMenu(props) {
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
	} = useContext(robotContext)

	const [modalVisibility, setModalVisiblity] = React.useState(false)

	console.log({
		userId,
		email,
		balance,
		isRealAccount,
		password,
	})
	const history = useHistory();

	const [anchorEl, setAnchorEl] = useState(null);

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleHome = () => {
		history.push('/home');
	};

	const handleConfiguration = () => {
		history.push(`/configuration/${props.id}/${props.email}/${props.password}/${props.mode}/${props.balance}`);
	};

	const handleUserManagement = () => {
		history.push(`/userManagement/${props.id}/${props.email}/${props.password}/${props.mode}/${props.balance}`);
	}

	const handleSignalConfiguration = () => {
		history.push(`/signalConfiguration/${props.id}/${props.email}/${props.password}/${props.mode}/${props.balance}`);
	}

	const handleAdminSettings = () => {
		history.push(`/adminSettings/${props.id}/${props.email}/${props.password}/${props.mode}/${props.balance}`);
	}

	const handleSystemSettings = () => {
		history.push(`/systemSettings/${props.id}`);
	}


	return (
		<div style={{ width: '75%' }}>
			<Button variant="outlined" aria-controls="simple-menu" aria-haspopup="true" color="default" onClick={handleClick} style={{ color: '#fff', border: '2px solid #fff', borderRadius: 10, marginLeft: 15, display: 'flex' }}>
				<b>Menu</b>
			</Button>
			<Menu
				id="simple-menu"
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleClose}
			>
				{
					userId != 1 &&
					/* true && */
					<MenuItem onClick={handleConfiguration}>
						<Icon.Build />Configurações
					</MenuItem>
				}
				{
					(userId == 2 || userId == 3 || userId == 1) &&
					/* true && */
					<MenuItem onClick={handleUserManagement}>
						<Icon.SupervisorAccount />Ger.Usuários
					</MenuItem>
				}
				{
					(userId == 1 || userId == 2 || userId == 3) &&
					/* true && */
					<MenuItem onClick={handleSignalConfiguration}>
						<Icon.List />Lista Sinais
					</MenuItem>
				}
				{
					userId == 2 &&
					/* true && */
					<MenuItem onClick={handleAdminSettings}>
						<Icon.Lock />Ger. Sistema
					</MenuItem>
				}
				{
					userId == 1 &&
					/* true && */
					<MenuItem onClick={handleSystemSettings}>
						<Icon.Lock />Ger. Sistema
					</MenuItem>
				}
				<MenuItem onClick={() => setModalVisiblity(true)}>
					<Icon.ExitToApp />Sair
				</MenuItem>
			</Menu>
			<Dialog
				open={modalVisibility}
				onClose={() => setModalVisiblity(false)}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description" >

				<DialogTitle id="alert-dialog-title">{"Sair"}</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Deseja realmente sair ?
          						</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setModalVisiblity(false)} color="error">
						Cancelar
          						</Button>
					<Button onClick={handleHome} color="primary" autoFocus>
						Confirmar
          					</Button>
				</DialogActions>
			</Dialog>
		</div>
	)
}

export default HydraMenu
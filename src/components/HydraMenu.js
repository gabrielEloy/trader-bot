import React, { useState } from 'react'
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import * as Icon from '@material-ui/icons';

import 'global.css';

function HydraMenu(props) {
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
				<MenuItem onClick={handleHome}>
					<Icon.Home />Login
				</MenuItem>
				{
					props.id != 1 &&
					<MenuItem onClick={handleConfiguration}>
						<Icon.Build />Configurações
					</MenuItem>
				}
				{
					(props.id == 2 || props.id == 3) &&
					<MenuItem onClick={handleUserManagement}>
						<Icon.SupervisorAccount />Ger.Usuários
					</MenuItem>
				}
				{
					(props.id == 1 || props.id == 2 || props.id == 3) &&
					<MenuItem onClick={handleSignalConfiguration}>
						<Icon.List />Lista Sinais
					</MenuItem>
				}
				{
					props.id == 2 &&
					<MenuItem onClick={handleAdminSettings}>
						<Icon.Lock />Ger. Sistema
					</MenuItem>
				}
				{
					props.id == 1 &&
					<MenuItem onClick={handleSystemSettings}>
						<Icon.Lock />Ger. Sistema
					</MenuItem>
				}
			</Menu>
		</div>
	)
}

export default HydraMenu
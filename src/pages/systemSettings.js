import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';


import { showToast } from 'components/Toast';
import HydraMenu from 'components/HydraMenu';
import RedSwitch from 'components/RedSwitch';

import api from 'services/api';

import 'global.css';
import './systemSettings.css';

export default function SystemSettings(props) {
	const [status, setStatus] = useState(false);	

	async function loadSettings() {
		let status = await api.get('/indexSettings')
		const locked = status.data.settings.locked_by_system
		setStatus(locked)
	}

	useEffect(() => {
		loadSettings()
	}, [])

	const handleStatus = async () => {
		setStatus(!status)

		const res = await api.patch('/updateSystem')
		if (res.data.settings.type === 'error') {
			showToast({ type: 'warn', message: res.data.settings.ex })
			setStatus(!status)
		}

		showToast({ type: res.data.settings.type, message: res.data.settings.message })
	}

	return (
		<div className="App">
			<ToastContainer />
			<HydraMenu id={props.match.params.id} />
			<div className="App-center">
				<h3>Gerenciamento do Sistema</h3>
				<div>
					<RedSwitch onChange={handleStatus} checked={status} />
				</div>
			</div>
		</div>
	)
}

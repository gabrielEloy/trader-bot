import { withStyles } from '@material-ui/core';
import { Switch } from 'formik-material-ui';

const RedSwitchFormik = withStyles({
	root: {
		width: 60,
		height: 40
	},
	switchBase: {
		color: '#E1E1D6',
		'&$checked': {
			color: '#f1c40f',
		},
		'&$checked + $track': {
			backgroundColor: '#f1c40f',
		},
	},
	checked: {},
	track: {},
})(Switch);

export default RedSwitchFormik;
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
			color: '#dc0c30',
		},
		'&$checked + $track': {
			backgroundColor: '#dc0c30',
		},
	},
	checked: {},
	track: {},
})(Switch);

export default RedSwitchFormik;
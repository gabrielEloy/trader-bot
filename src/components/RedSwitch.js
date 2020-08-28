import { Switch, withStyles } from '@material-ui/core';

const RedSwitch = withStyles({
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

export default RedSwitch;
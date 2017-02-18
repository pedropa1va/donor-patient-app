// This is the initial page, where you can choose to be a donor or a patient
import React from 'react';
import Donor from './Donor';
import Patient from './Patient';
import {Link} from 'react-router';

class Initial extends React.Component {
	render() {
		return (
			<div className="initial">
			<h2>Welcome to Blood Donor Finder App</h2>
			<h3>Are you a patient or a donor?</h3>
				<button class="btn btn-default"><Link to='/Patient'>Patient</Link></button> <button class="btn btn-default"><Link to='/Donor'>Donor</Link></button>
				{this.props.children}
			</div>
		)
	}
}

export default Initial;
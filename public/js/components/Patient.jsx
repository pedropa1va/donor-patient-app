import React from 'react';
import Donor from './Donor';
import {Link} from 'react-router';

//what blood types a patient can receive according to their own blood type:
//source: http://www.thebloodcenter.org/donor/BloodFacts.aspx
const BLOOD_TYPES = {
	'O+': ['O+', 'O-'],
	'A+': ['A+', 'A-', 'O+', 'O-'],
	'B+': ['B+', 'B-', 'O+', 'O-'],
	'AB+': ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'], //or ALL/* for query searches
	'O-': ['O-'],
	'A-': ['A-', 'O-'],
	'B-': ['B-', 'O-'],
	'AB-': ['AB-', 'A-', 'B-', 'O-']
}

class Patient extends React.Component {
	handleSubmit(){
		
	}
	render() {
		return (
			<div id="Patient">
				<h1>Patient</h1>
				<h3>Become a donor!</h3>
				<button class="btn btn-default">
					<Link to='/Donor'>Donor</Link>
				</button>
			</div>
		)
	}
}

export default Patient;
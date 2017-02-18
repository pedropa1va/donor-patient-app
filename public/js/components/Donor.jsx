import React from 'react';
import Patient from './Patient';
import {Link} from 'react-router';

class Donor extends React.Component {
   render() {
      return (
         <div id="Donor">
            <h1>Donor</h1>
            <h3>Find other donors as a patient!</h3>
			<button>
				<Link to='/Patient'>Patient</Link>
			</button>
         </div>
      )
   }
}

export default Donor;
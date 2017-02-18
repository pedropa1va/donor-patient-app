// The purpose of this component is to render all the markup that is common across all routes

import React from 'react';

export default React.createClass({
   render: function() {
      return this.props.children;
   }
});
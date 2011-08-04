
//only supported city is sanfran right now but this is here to make it easier to support more in the future
Crave.checkSupportedCity = function(coords, callback) {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({location: new google.maps.LatLng(coords.latitude, coords.longitude)}, function(results, status) {
    var supported = false, city = "Unknown city";
    if (status === google.maps.GeocoderStatus.OK) { //bad response means we don't know, so assume its bad??
      for (var i = 0; i<results.length; i++) {
        var result = results[i];
        if (['street_address', 'neighborhood', 'postal_code', 
          'locality'].indexOf(result.types[0] > -1)) {
          
          var city_component = TouchBS.get_address_component_type(result.address_components, 'locality');
          if (city_component) {
            city = city_component.long_name;
          }
          if (city === 'San Fransisco') {
            supported = true;
            break;
          } 
        }
      }
    }
    callback(supported, city); 
  });
};


Crave.buildCityVotePanel = function() {
  var city_field = new Ext.form.Text({
    name: 'city'
  });
  var email_field = new Ext.form.Text({
    xtype: 'textfield', 
    name: 'email', 
    inputType: 'email', 
    placeHolder: "My E-mail Address"
  });
  var form = new Ext.form.FormPanel({
    url: '/',
    cls: 'framePanel voteForm',
    items:  [{
      xtype: 'panel', 
      cls: 'label',
      html: "I want Crave in: "
    },city_field,email_field],
    listeners: {
      beforesubmit: function() {
        if (!email_field.getValue()) {
          email_field.el.addCls('requiredField');
        } else {
          alert('submit!');
        }
        return false;
      }
    }
  });
  Crave.cityVotePanel = new Ext.Panel({
    //layout: 'fit',
    dockedItems: Crave.create_titlebar({
      title: "Vote for your city",
      items: [{
        text: "Nevermind", 
        handler: function() {
          Crave.viewport.setActiveItem(Crave.nearbyPanel);
        }
      },{
        text: "Vote",
        handler: function() {
          form.submit();
        }
      }]
    }),
    items: form,
    set_city: function(city) {
      city_field.setValue(city);
    }
  });
  
  return Crave.cityVotePanel;
  
};

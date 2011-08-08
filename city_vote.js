
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
          if (city === 'San Francisco') {
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
    name: 'city',
    cls: 'last',
    placeholder: "My City"
  });
  var email_field = new Ext.form.Text({
    xtype: 'textfield',
    cls: 'first',
    name: 'email', 
    inputType: 'email', 
    placeHolder: "E-mail Address"
  });
  var form = new Ext.form.FormPanel({
    url: '/',
    cls: 'framePanel cityVoteForm',
    items:  [{
      xtype: 'panel',
      cls: 'label',
      style: 'text-align: center;',
      html: "Let us know your city and email, and we'll let you know when we launch there."
    },email_field,city_field, {
      xtype: 'button',
      text: "Vote for your city",
      handler: function() {
        form.submit();
      }
    }],
    listeners: {
      beforesubmit: function() {
        if (!email_field.getValue()) {
          email_field.el.addCls('requiredField');
        } else {
          Ext.Ajax.request({
            method: "POST",
            url: '/user_vote_cities.json',
            jsonData: {
              "user_vote_city":{
                "email":email_field.getValue(),
                "latitude":Crave.latest_position.latitude,
                "longitude":Crave.latest_position.longitude,
                "city": city_field.getValue()
                }
            },
            success: function() {
              Ext.Msg.alert("Thanks", "Thanks for your vote!");
            },
            failure: TouchBS.handle_failure
          });
          return false;
        }
      }
    }
  });
  Crave.cityVotePanel = new Ext.Panel({
    bodyCls: 'cityVoteBody',
    items: form,
    set_city: function(city) {
      city_field.setValue(city);
    }
  });
  
  return Crave.cityVotePanel;
  
};

restaurantTemplate = Ext.XTemplate.from('restaurantTemplate', {
  distDisplay: function(miles) {
    var feet = Math.round(miles * 5280);
    if(feet<1000) {
      return feet+" feet";
    } else {
      return parseFloat(miles).toFixed(1)+' miles';
    }
  }
});

restaurantDishTemplate = Ext.XTemplate.from('restDishTemplate');

var places = new Ext.data.Store({
   model: 'Restaurant',
   id: 'places',
   clearOnPageLoad: false,
   proxy: {
     type:'ajax',
     url: '/places.json',
     reader: {
       type: 'json',
       record: 'restaurant'
     }
   }
});

var singleRestaurantStore = new Ext.data.Store({
    model: 'Dish',
    sorters: [{property: 'arating', direction: 'ASC'}],
    getGroupString : function(record) {
       return Crave.ratingDisplay(record.get('rating'));
    },
    proxy: {
      type:'ajax',
      url:'',
      reader: {
        type:'json',
        record:'menu_item'
      }
    }
});
var restaurantMarker = null;

function placeDisplay(restaurant_id) {
  singleRestaurantStore.proxy.url = ('/places/'+restaurant_id+'/items.json');

  Crave.viewport.setActiveItem(placePnl);
  singleRestaurantStore.load(function(){
    var totalRatings = 0;
    singleRestaurantStore.each(function() {
      var ratings = this.data.rating_count;
      if(ratings!="") {
        var additionValue = parseInt(this.data.rating_count.toString().replace(" reviews",""));
        console.log(additionValue);
        totalRatings = totalRatings + additionValue;
      }
    });
    $("#restaurantTotalRatings").html(totalRatings);
  });

  Ext.Ajax.request({
    method: 'GET',
    url: ('/places/'+restaurant_id+'/details.json'),
    reader: {
      type: 'json'
    },
    success: function(response) {
      //try looping through single restaurant store here
      //populate top panel with restaurant data, map
      var restaurant = Ext.decode(response.responseText).restaurant;
      //set restaurant data locally now
      localStorage.setItem('editRestaurantId',restaurant.id);
      var htmlString = '<div class="restaurantInfo"><span class="restName">'+
      restaurant.name+'</span><a target="_blank" href="' +
      'http://maps.google.com/maps?ll=' + [restaurant.latitude, restaurant.longitude].join(',') +
      '" class="restAddress">'+
      restaurant.street_address+', '+
      restaurant.city +
      '<br><span id="restaurantTotalRatings"></span> ratings</span>';

      if (restaurant.telephone) {
        htmlString = htmlString +'<a href="tel:' + restaurant.telephone + '" class="phoneNumberLink">' + TouchBS.formatted_phone_number(restaurant.telephone) + '</a>';
      }

      htmlString = htmlString + '</div>';
      Ext.getCmp('restInfoPnl').update(htmlString);

      var map = Ext.getCmp('googleMap');
      map.restaurant_latitude = restaurant.latitude;
      map.restaurant_longitude = restaurant.longitude;
      map.update(restaurant);
      if (restaurantMarker) {
        restaurantMarker.setMap(null);
      }
      restaurantMarker = new google.maps.Marker({
        position: new google.maps.LatLng(restaurant.latitude,restaurant.longitude),
        map: Ext.getCmp('googleMap').map,
        title: 'restaurant'
      });
    }
  });
}
var newRestaurant = new Ext.form.FormPanel({
    scroll: 'vertical',
    dockedItems:[Crave.create_titlebar({
      items: [{
        text:'Back',
        ui:'back', 
        handler: Crave.back_handler
      }]
    })],
    items: [
       {xtype: 'fieldset', title: 'New Restaurant', items: [
            {
                xtype: 'textfield',
                label:'Name',
                name: 'restaurant[name]',
                id: 'restaurantName'
		    },
           {xtype: 'textfield', name: 'restaurant[latitude]', id: 'latfield', hidden: true},
           {xtype: 'textfield', name: 'restaurant[longitude]', id: 'lngfield', hidden: true},
           {
               xtype: 'textfield',
               label:'Address',
               name: 'restaurant[street_address]',
               id: 'restaurantAddress'
           },
           {
               xtype: 'textfield',
               label:'Neighborhood',
               name: 'restaurant[neighborhood]',
               id: 'restaurantNeighborhood'
           },
           {
               xtype: 'textfield',
               label:'City',
               value: 'San Francisco',
               name: 'restaurant[city]',
               id: 'restaurantCity'
           },
           {
               xtype: 'textfield',
               value: 'CA',
               label:'State',
               name: 'restaurant[state]',
               id: 'restaurantState'
           },
           {
               xtype: 'textfield',
               label:'Zip',
               name: 'restaurant[zip]',
               id: 'restaurantZip'
           },
           {
               xtype: 'textfield',
               label:'Country',
               value: 'USA',
               name: 'restaurant[country]',
               id: 'restaurantCountry'
           },
           {
               xtype: 'textfield',
               label:'Cross Street',
               name: 'restaurant[cross_street]',
               id: 'restaurantCross'
           },
           {
               xtype:'button',
               text: 'Submit',
               handler: function() {
                   var s = Ext.getCmp('restaurantAddress').getValue()+" "+Ext.getCmp('restaurantCity').getValue()+" "+Ext.getCmp('restaurantState').getValue()+" "+Ext.getCmp('restaurantZip').getValue();

                   var geocoder = new google.maps.Geocoder();
                   geocoder.geocode( {'address': s}, function(results, status) {
                       if (status == google.maps.GeocoderStatus.OK) {
                           stringLocation = results[0].geometry.location.toString().replace("(","").replace(")","");
                           coordsArray = stringLocation.split(",");
                           Ext.getCmp('latfield').setValue($.trim(coordsArray[0]));
                           Ext.getCmp('lngfield').setValue($.trim(coordsArray[1]));
                           newRestaurant.submit({
                               url: '/places',
                               method: 'post',
                               submitDisabled: true,
                               waitMsg: 'Saving Data...Please wait.',
                               success: function (objForm,httpRequest) {
                                   var mbox = new Ext.MessageBox({});
                                   mbox.alert("Record Saved");
                                   //redirect back to restaurant list?
                               },
                               failure: function() {
                                   console.log('submissionFailed');
                               }
                           })
                       } else {
                           alert("Cannot resolve that address for the following reason: " + status);
                       }
                   });
               }
           }
        ]}
    ]
});

var aRestaurantList = new Ext.List({
    id:'aRestaurantList',
    itemTpl: restaurantDishTemplate,
    itemSelector: '.adish',
    singleSelect: true,
    grouped: true,
    indexBar: false,
    layout:{type:'vbox'},
    store: singleRestaurantStore,
    scroll: false,
    width:'100%',
    hideOnMaskTap: false
});

aRestaurantList.on('itemtap', function(dataView, index, item, e) {
  var record = dataView.store.data.items[index];
  Crave.back_stack.push({
    panel: placePnl
  });
  Crave.show_menu_item(record.data.id);
});

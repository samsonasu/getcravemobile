restaurantTemplate = Ext.XTemplate.from('restaurantTemplate',
    {distDisplay: function(miles) {
        feet = Math.round(miles * 5280);
        if(feet<1000) {
            return feet+" feet";
        } else {
            return parseFloat(miles).toFixed(1)+' miles';
        }
    }});

restaurantDishTemplate = Ext.XTemplate.from('restDishTemplate');

var places = new Ext.data.Store({
   model: 'Restaurants',
   id: 'places',
   clearOnPageLoad: false,
   proxy: {
       type:'ajax',
       url: '/places.json',
       reader: {
           type:'json',
           record:'restaurant'
       }
   }
});

var singleRestaurantStore = new Ext.data.Store({
    model: 'RestaurantDish',
    sorters: [{property: 'arating', direction: 'ASC'}],
    getGroupString : function(record) {
        rating = parseInt(record.get('rating'));
        if(rating==5) {
            return "<img src='../images/rating-stars/rating-dish-5.png'>";
        }
        if(rating==4) {
            return "<img src='../images/rating-stars/rating-dish-4.png'>";
        }
        if(rating==3) {
            return "<img src='../images/rating-stars/rating-dish-3.png'>";
        }
        if(rating==2) {
            return "<img src='../images/rating-stars/rating-dish-2.png'>";
        }
        if(rating==1) {
            return "<img src='../images/rating-stars/rating-dish-1.png'>";
        } else {
            return "unrated";
        }
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

function placeDisplay(restaurant_id) {
    singleRestaurantStore.proxy.url = ('/places/'+restaurant_id+'/items.json');

    console.log('set to 4');
    Ext.getCmp('mainPnl').setActiveItem(4);
    singleRestaurantStore.load(function(){
        console.log('store loaded');
        totalRatings = 0;
        singleRestaurantStore.each(function() {
           console.log(this.data.rating_count);
           ratings = this.data.rating_count;
           if(ratings!="") {
               additionValue = parseInt(this.data.rating_count.toString().replace(" reviews",""));
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
             var responseObject = Ext.decode(response.responseText);
            //set restaurant data locally now
             localStorage.setItem('editRestaurantId',responseObject.restaurant.id);
             htmlString = '<div class="restaurantInfo"><span class="restName">'+responseObject.restaurant.name+'</span><span class="restAddress">'+responseObject.restaurant.street_address+', '+responseObject.restaurant.city+'<br><span id="restaurantTotalRatings"></span> ratings</span><!--<a class="newDish">add dish</a>--></div>';
             Ext.getCmp('restInfoPnl').update(htmlString);

            var placeholder = new google.maps.Marker(
                {
                    position: new google.maps.LatLng(responseObject.restaurant.latitude,responseObject.restaurant.longitude),
                    map: Ext.getCmp('googleMap').map,
                    title: 'restaurant'
                }
            );
            // woah baby, this is a nasty hack but the map refuses to behave unless you trigger resize after a delay AFTER the initial ajax returns
            Ext.Ajax.request({
                method: 'GET',
                url: '/places/'+restaurant_id + '/items.json',
                reader: {
                   type: 'json'
                },
                success: function(response) {
                    google.maps.event.trigger(Ext.getCmp('googleMap').map, 'resize');
                    var initialLocation = new google.maps.LatLng(responseObject.restaurant.latitude,responseObject.restaurant.longitude);
                    Ext.getCmp('googleMap').update(initialLocation);
                    //needs work becoming resuable, maybe have to destroy this on unload
                }
            });
        }
    });
}
var newRestaurant = new Ext.form.FormPanel({
    scroll: 'vertical',
    dockedItems:[
       {
           dock:'top',
           xtype:'toolbar',
           ui:'light',
           title:'Crave',
           items:[{text:'Back',ui:'back', handler:backHandler}]
       }
    ],
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

var reviewForm = new Ext.form.FormPanel({
    fullScreen:true,
           items: [
            {
            xtype: 'textfield',
            name: 'menu_item_rating[rating]',
                id:'menuRating',
                hidden:true
            },
            {
                xtype: 'textfield',
                name: 'menu_item_rating[review]',
                width:'100%',
                height:'200',
                placeHolder: 'Write a review',
                cls:'reviewField',
                id: 'review'
		    },
           {
               xtype: 'textfield',
               name: 'menu_item_rating[menu_item_id]',
               id: 'menuId',
               hidden:true
           },
           {
               xtype: 'textfield',
               name: 'menu_item_rating[user_id]',
               id: 'userId',
               hidden:true
           }
       ]
});

var reviewFormPnl = new Ext.Panel({
    id: 'reviewFormPnl',
    dockedItems:[
        {
            dock:'top',
            xtype:'toolbar',
            ui:'light',
            title:'<img class="cravelogo" src="../images/crave-logo-horizontal-white.png">',
             layout: {
                 type: 'hbox',
                 pack:'justify'
             },
            items:[{text:'Back',ui:'back', handler:backHandler},{text:'Submit',ui:'normal', handler:rateHandler}]
        }
    ],
    items: [
        {
            html: '<div class="starContainer"><div class="starLabel">Have you tried this</div><div class="starRating ratingOf0"><button class="starcover" id="id-star1"></button><button class="starcover" id="id-star2"></button><button class="starcover" id="id-star3"></button><button class="starcover" id="id-star4"></button><button class="starcover" id="id-star5"></button></div></div>',
            height:'80',
            width:'100%'
        },
            reviewForm
    ]
});

var aRestaurantList = new Ext.List({
    id:'aRestaurantList',
    itemTpl: restaurantDishTemplate,
    singleSelect: true,
    grouped: true,
    indexBar: false,
    layout:{type:'vbox'},
    fullscreen:false,
    store: singleRestaurantStore,
    scroll: false,
    width:'100%',
    height:'334px',
    modal:true,
    hideOnMaskTap: false
});

aRestaurantList.on('itemtap', function(dataView, index, item, e) {
    record = dataView.store.data.items[index];
    console.log(urlPrefix+'/items/'+record.data.id+'.json');
    Ext.Ajax.request({
        url: (urlPrefix+'/items/'+record.data.id+'.json'),
        reader: {
             type: 'json'
        },
        success: function(response) {
            dishDisplay(response);
        }
    });
    Ext.getCmp('mainPnl').setActiveItem(0);
});

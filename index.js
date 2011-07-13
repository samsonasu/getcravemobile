Ext.setup({
  glossOnIcon: false,
  onReady: function() {
    urlPrefix = "http://getcrave.com";
    var local = false;

    if(window.location.toString().indexOf("local")>-1) {
      //urlPrefix = '/wg/proxy.php?url=http://blooming-water-228.heroku.com';
      urlPrefix = '/cravecomp';
      local = true;
    }

    Ext.Ajax.on('beforerequest', function(conn, options){
      if (options.url.substring(0, urlPrefix.length) !== urlPrefix) {
        options.url = urlPrefix + options.url;
      }
      if (local) {
        if (!options.params) {
          options.params = {};
        }
        options.params.mobile = "true";
      }
    }, this);


    navigator.geolocation.getCurrentPosition(function(position) {
      var coords = position.coords;
      if(window.location.toString().indexOf("local")>-1) {
        coords = {
          latitude: 37.77867,
          longitude: -122.39127
        };
      }

      dishStore.proxy.extraParams = {
        "lat": coords.latitude,
        "long": coords.longitude,
        limit: 25
      }
      
      dishStore.load(function() {
        console.log('dish store loaded');
        console.log(dishStore);
      });

      places.proxy.extraParams = {
        "lat": coords.latitude,
        "long": coords.longitude,
        limit: 25
      }

      places.load();
      Crave.activityStore.load();
    }, function() {
      //failure handler
      console.log("no location available");
      alert("We couldn't find your location, some features may be disabled because of this. ")
    });


    var placesList = new Ext.List({
      itemTpl: restaurantTemplate,
      singleSelect: true,
      grouped: false,
      indexBar: false,
      store: places,
      floating:true,
      centered:true,
      modal:true,
      hideOnMaskTap: false,
      clearSectionOnDeactivate:true,
      plugins: [new Ext.plugins.ListPagingPlugin()]
    });
    placesList.on('itemtap', function(dataView, index, item, e) {
      record = dataView.store.data.items[index];
      placeDisplay(record.data.id);
    });

    var dishList = new Ext.List({
      itemTpl: dishTemplate,
      itemSelector: '.adish',
      singleSelect: true,
      grouped: true,
      indexBar: false,
      store: dishStore,
      id:'dishesNearbyList',
      scroll:'vertical',
      hideOnMaskTap: false,
      clearSectionOnDeactivate:true,
      plugins: [new Ext.plugins.ListPagingPlugin()]
    });

    dishList.on('itemtap', function(dataView, index, item, e) {
      var thisId = dishStore.findRecord("name",$(".dishname", item).text()).data.id;
      Crave.show_menu_item(thisId);
    });

    var savedList = new Ext.List({
      itemTpl: dishTemplate,
      itemSelector: '.adish',
      singleSelect: true,
      grouped: true,
      indexBar: false,
      store: savedDishStore,
      id:'savedList',
      scroll:'vertical',
      hideOnMaskTap: false,
      width:'100%',
      height:'100%',
      clearSectionOnDeactivate:true
    });
    savedList.on('itemtap', function(dataView, index, item, e) {
      var thisId = dishStore.findRecord("name",$(".dishname", item).text()).data.id;
      Ext.Ajax.request({
        url: ('/items/'+thisId+'.json'),
        reader: {
          type: 'json'
        },
        success: function(response) {
          dishDisplay(response);
        }
      });
      Ext.getCmp('mainPnl').setActiveItem(0);
    });

    var infoPnl = new Ext.Panel({
      html: '',
      id: 'infoPnl',
      width:'100%'
    });

    var restMapPnl = new Ext.Panel ({
      items: [
      {
        id: 'googleMap',
        xtype: 'map',
        useCurrentLocation: false,
        height:100,
        width:100,
        mapOptions : {
          center : new google.maps.LatLng(37.774518,-122.420101),  //SF
          //not really centering here, just putting it in top right corner
          zoom : 17,
          mapTypeId : google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
          navigationControl: false
        }
      }
      ],
      height:100,
      width:100
    });
    var restInfoPnl = new Ext.Panel({
      html: '',
      id: 'restInfoPnl',
      height:'100%',
      width:'100%'
    });
    var restPnl = new Ext.Panel({
      id: 'restPnl',
      layout: 'hbox',
      items:[restMapPnl,restInfoPnl],
      width:'100%',
      height:100
    });

    var reviewPnl = new Ext.Panel({
      html: '',
      scroll: 'vertical',
      id: 'reviewPnl'
    });

    var sessionHandler = function(b,e) {
      var target = $(e).attr("class");
      /*if(b.getText() == "Login") {
                   window.location = 'http://getcrave.com/auth/facebook';
               }
               if(b.getText() == "Logout") {
                   localStorage.setItem("uid","");
                   Ext.getCmp("loginButton").setVisible(true);
                   Ext.getCmp("logoutButton").setVisible(false);
               }
               if(b.getText() == "New Restaurant") {
                   Ext.getCmp('listPnl').setActiveItem(newRestaurant);
               }
               */
      if(target == "nearBy") {

      }
      if(target == "me") {
        // The process of becoming a badass javascript programmer is paved with endless acts of idiocy
        var amiLoggedIn = isLoggedIn();
        if(amiLoggedIn) {
          console.log('/users/'+localStorage.getItem("uid")+'/ratings.json?page=1');
          var uid = localStorage.getItem('uid');
          loggedinProfilePnl.setLoading(true);
          Ext.Ajax.request({
            method: 'GET',
            url: "/users/" + uid + "/ratings.json",
            params: {
              page: 1
            },
            reader: {
              type: 'json'
            },
            success: function(response) {
              var responseObject = Ext.decode(response.responseText);
              //loop through ratings
              //add each one as data store item to myDishStore
              var ratingsArray = new Array();
              for(g=0;g<responseObject.user.menu_item_ratings.length;g++) {
                var newRating = responseObject.user.menu_item_ratings[g];
                //the id represents the dish id
                ratingsArray[g] = {
                  id: newRating.menu_item.id,
                  rating: newRating.rating,
                  name: newRating.menu_item.name,
                  restaurant_name: newRating.menu_item.restaurant.name,
                  review: newRating.review,
                  menu_item_id: newRating.menu_item_id
                  };
                myDishStore.loadData(ratingsArray);
              //refresh myDishList here
              }
              loggedinProfilePnl.setLoading(false);
              myDishList.refresh();
            }
          });
          Ext.Ajax.request({
            method: 'GET',
            url: "/users/" + uid + ".json",
            reader: {
              type: 'json'
            },
            success: function(response) {
              var responseObject = eval('(' + response.responseText + ')');
              $(".userPic").html('<img src="'+responseObject.user.user_profile_pic_url+'?type=large" width="100" height="100">');
              $(".reviewCount").html(responseObject.user.user_ratings_count+" reviews");
              $(".profileUsername").html('<span class="userName">'+responseObject.user.user_name+'</span>');
            }
          });
        }
      }
      console.log(b);
      console.log(e);
      if(target == "saved") {
        savedDishStore.proxy.url = "/users/" + uid + "/saved.json";
        savedDishStore.load(function() {
          console.log('saved dish store loaded');
          console.log(savedDishStore);
        });
      }
    }

    var tapHandler = function(b,e) {
      if(b.getText() == "Food") {
        Ext.getCmp('listPnl').setActiveItem(dishList);
      //Ext.getCmp("newRestButton").setVisible(false);
      }
      if(b.getText() == "Places") {
        Ext.getCmp('listPnl').setActiveItem(placesList);
      //Ext.getCmp("newRestButton").setVisible(true);
      }
    }
    var filtersHandler = function(b,e) {
     em(filterListPnl);
      //Ext.getCmp('mainPnl').setActiveItem(filterListPnl);
      labelString = "";
    }

    var detailPnl = new Ext.Panel({
      items: [infoPnl,reviewPnl],
      id: 'detailPnl',
      layout: {
        type: 'vbox',
        align: 'start',
        direction: 'normal'
      },
      scroll:'vertical',
      width:'100%',
      height:'100%',
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
        items:[{
          text:'Back',
          ui:'back',
          handler:backHandler
        },{
          text:'Rate',
          ui:'normal',
          handler:rateHandler
        }]
      }
      ]
    });

    var savedPnl = new Ext.Panel({
      id: 'savedPnl',
      items: [savedList],
      width:'100%',
      height:'100%',
      dockedItems:[
      {
        dock:'top',
        xtype:'toolbar',
        ui:'light',
        title:'Saved Items'
      }
      ]
    });


    //intentionally not using var to make this global
    listPnl = new Ext.Panel({
      id: 'listPnl',
      items: [dishList,placesList,searchPnl,newRestaurant],
      layout: {
        type: 'card'
      },
      width:'100%',
      height:'100%',
      cardSwitchAnimation: 'slide',
      direction:'horizontal',
      dockedItems: [{
        id: 'topPanel',
        xtype: 'toolbar',
        ui:'light',
        dock: 'top',
        layout:{
          pack:'center'
        },
        items:[{
          xtype:'segmentedbutton',
          items:[{
            text:'Food',
            id:'dishesButton',
            pressed:true,
            handler:tapHandler,
            ui:'round',
            width:'110'
          },{
            text:'Places',
            id:'placesButton',
            pressed:false,
            handler:tapHandler,
            ui:'round',
            width:'110'
          }]
        },{
          xtype:'button',
          iconCls:'filtersButton',
          handler: function() {
            filterListPnl.ownerCt.setActiveItem(filterListPnl);
          }
        }]
      },searchForm
      ]
    });

    var placePnl = new Ext.Panel({
      id: 'placePnl',
      items: [restPnl, aRestaurantList],
      layout: {
        type: 'vbox',
        align: 'start',
        direction: 'normal'
      },
      dockedItems:[
      {
        dock:'top',
        xtype:'toolbar',
        ui:'light',
        title:'<img class="cravelogo" src="../images/crave-logo-horizontal-white.png">',
        items:[{
          text:'Back',
          ui:'back',
          handler: backHandler
        }]
      }
      ]
    });


    var mainPnl = new Ext.TabPanel({
      id: 'mainPnl',
      layout:'card',
      activeItem:1,
      items: [{
        items:[detailPnl]
      },{
        title:'Nearby',
        iconCls:'nearBy',
        id:'listPnlTab',
        items:[listPnl]
      },
      Crave.activityPanel, {
        title:'Saved',
        iconCls:'saved',
        items:[savedPnl]
      },{
        title:'Me',
        iconCls:'me',
        items:[profilePnl]
      },
      placePnl, {
        width:0,
        items:[newDishForm]
      },{
        width:0,
        items:[reviewFormPnl]
      }],
      tabBar: {
        dock: 'bottom',
        ui: 'dark',
        listeners: {
          click: sessionHandler,
          element: 'body'
        },
        layout: {
          pack: 'center'
        }
      },
      cardSwitchAnimation: 'slide',
      direction:'horizontal'
    });

    Crave.viewport = new Ext.Panel({
      fullscreen: true,
      layout: 'card',
      items: [mainPnl, filterListPnl]
    });

    justLoggedIn();

    $(".starcover").live("click",function(event) {
      var rating = event.currentTarget.id.toString().replace("id-star","");
      var ratingClasses = new Array("ratingOf0","ratingOf1", "ratingOf2","ratingOf3","ratingOf4","ratingOf5");
      for(i=0;i<ratingClasses.length;i++) {
        $(".starRating").removeClass(ratingClasses[i].toString());
      }
      if(rating==1) {
        $(".starRating").addClass("ratingOf1");
      }
      if(rating==2) {
        $(".starRating").addClass("ratingOf2");
      }
      if(rating==3) {
        $(".starRating").addClass("ratingOf3");
      }
      if(rating==4) {
        $(".starRating").addClass("ratingOf4");
      }
      if(rating==5) {
        $(".starRating").addClass("ratingOf5");
      }
      Ext.getCmp("menuRating").setValue(rating);
      console.log(Ext.getCmp("menuRating").getValue());
    });
    $(".startuppic").remove();
  }
});

$(".newDish").live("click",function() {
  //activate new dish form
  Ext.getCmp('mainPnl').setActiveItem(3);
  return false;
});
$(".logoutButton").live("click", function() {
  localStorage.setItem("uid","");
});

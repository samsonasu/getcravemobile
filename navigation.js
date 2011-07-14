var backHandler = function(b,e) {
   //this should be much better
   Crave.viewport.setActiveItem(0);
   Ext.getCmp('mainPnl').setActiveItem(listPnl);
   listPnl.setActiveItem(1);
}
var rateHandler = function(b,e) {
    if(b.getText() == "Rate") {
        Ext.getCmp('mainPnl').setActiveItem(reviewFormPnl);
    }

    if(b.getText() == "Submit") {
        reviewForm.submit({
            url: '/ratings?mobile=1',
            method: 'post',
            submitDisabled: true,
            waitMsg: 'Saving Data...Please wait.',
            success: function (objForm,httpRequest) {
                var mbox = new Ext.MessageBox({});
                mbox.alert("Record Saved");
            },
            failure: function() {
                console.log('submissionFailed');
            }
        })
    }

}

Crave.show_user_profile = function(user_id) {
  var mainPnl = Ext.getCmp('mainPnl');
  mainPnl.setActiveItem(profilePnl);
  profilePnl.setActiveItem(userProfilePnl);
  userProfilePnl.load_user_data(user_id);
};

Crave.show_menu_item = function(menu_item_id) {
  Ext.Ajax.request({
    method: 'GET', // REST is fun
    url: '/items/'+menu_item_id+'.json',
    reader: {
      type: 'json'
    },
    success: function(response) {
      dishDisplay(response);
    }
  });
  Ext.getCmp('mainPnl').setActiveItem(0);

  
  //Crave.viewport.setActiveItem(Crave.dishDisplayPanel);
  //Crave.dishDisplayPanel.load_dish_data(menu_item_id);

};

Crave.show_restaurant = function(restaurant_id) {
  placeDisplay(restaurant_id);
};

Crave.ratingDisplay = function(rating) {
  try {
    return "<img class='stars' src='../images/rating-my-" + parseInt(rating)+ ".png' >"
  } catch(ex) {
    return "unrated";
  }
}

//call this and then put it in docketItems[]
//config.items is any buttons you want (back button, etc)
Crave.create_titlebar = function(config) {
  return {
    dock:'top',
    xtype:'toolbar',
    ui:'light',
    title:'<img class="cravelogo" src="../images/crave-logo-horizontal-white.png">',
    layout: {
      type: 'hbox',
      pack:'justify'
    },
    items: config.items
  }
}
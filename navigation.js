var backHandler = function(b,e) {
   //this should be much better
   Crave.viewport.setActiveItem(listPnl);
   listPnl.setActiveItem(1);
}
var rateHandler = function(b,e) {
    if(b.getText() == "Rate") {
        Crave.viewport.setActiveItem(reviewFormPnl);
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
  Crave.viewport.setActiveItem(profilePnl);
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
  Crave.viewport.setActiveItem(detailPnl);

  
  //Crave.viewport.setActiveItem(Crave.dishDisplayPanel);
  //Crave.dishDisplayPanel.load_dish_data(menu_item_id);

};

Crave.show_restaurant = function(restaurant_id) {
  placeDisplay(restaurant_id);
};

Crave.ratingDisplay = function(rating) {
  try {
    
    var intRating = parseInt(rating);
    if (isNaN(intRating)) return "unrated";
    return "<img class='stars' src='../images/rating-my-" + intRating+ ".png' >"
  } catch(ex) {
    return "unrated";
  }
}

//call this and then put it in dockedItems[]
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
};


//many panels are contained within the main panel, i.e. the profile panel.  Howver
//when viewing someone else's profile, we don't want the "Me" tab on the bottom highlighted. 
//there's no way to do this in Ext so I just manually remove the class if you call this function
Crave.remove_tabbar_highlight = function() {
  $('.x-tabbar .x-tab.x-tab-active').removeClass('x-tab-active');
};
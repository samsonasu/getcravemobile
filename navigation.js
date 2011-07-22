Crave.show_user_profile = function(user_id) {
  Crave.viewport.setActiveItem(Crave.otherProfilePanel);
  Crave.otherProfilePanel.load_user_data(user_id);
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


/**
 *
 * To handle back behavior, anytime you navigate anywhere you should push an object into the stack,
  and set the handler of your new back button to Crave.back_handler. 
  The object you push onto back_stack should be a config object like below:
   {
     panel: thePanelToReturnTo, #this should be one of the panels in Crave.viewport, if not, you can probably just handle it yourself
     fn: function(backInfo), #if you have some complex back behavior, use this and the back handler won't do ANYTHING else
     callback: function(backInfo), #put a function here and i'll call it after the handler is done running, passing back whatever config has you put in the back_stack
     anim: {  #the animation.  If unspecified it will use slide/left
       type: 'slide', 
       direction: 'right',
       duration: 500
     }
   }
 */
Crave.back_stack = [];

Crave.back_handler = function() {
  var backInfo = Crave.back_stack.pop();
  try {
    if (!backInfo) {
      throw "nada"
    }
    if (backInfo.fn) {
      backInfo.fn(backInfo);
    } else {
      if (backInfo.panel) {
        var anim = backInfo.anim || {
          type: 'slide', 
          direction: 'right'
        };
        Crave.viewport.setActiveItem(backInfo.panel, backInfo.anim);
      } 
      if (backInfo.callback) { backInfo.callback(backInfo);}
    }
  } catch (ex) {
    if (location.href.indexOf('local') > -1)
      alert('Unhandled back button, please make a note of this and tell Samson.')
    
    console.log("can't figure out where to go back to!");
    Crave.viewport.setActiveItem(0, 'pop');
  }
  
}

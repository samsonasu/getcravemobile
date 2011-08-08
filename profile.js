Crave.buildLoginPanel = function() {
  return new Ext.Panel({
    html:'<div class="loginPanel"><img src="../images/profile-cold-food.png"><div class="explanation">Rate & Save Dishes, Follow Foodies</div><a href="#" onclick="Crave.facebookLogin();" class="loginButton"></a></div>',
    height: '100%'
  });
}
//mine is true for the "my profile" panel and false for the other people's one.
Crave.buildProfilePanel = function(mine) {
  var setupBackStack = function(subPanel) {
    Crave.back_stack.push({
      panel: profilePnl,
      user_id: profilePnl.displayed_user_id,
      callback: function(backInfo) {
        if (!mine) {
          //they just returned to the "other" profile panel via the back button, which means they were on someone else's profile
          profilePnl.load_user_data(backInfo.user_id);
        }
        profilePnl.setActiveItem(subPanel, false);
      }
    });
  }
  
  var userDishStore = new Ext.data.Store({
      model: 'MenuItemRating',
      clearOnPageLoad: false,
      sorters: [{property: 'created_at', direction: 'desc'}],
      proxy: {
        type:'ajax',
        extraParams: {},
        url: '',
        reader: {
          type:'json',
          model: 'MenuItemRating',
          record: 'menu_item_rating'
        }
      }
  });

  var userDishList = new Ext.List({
      itemTpl: new Ext.XTemplate.from('profileRatingTemplate'),
      itemSelector: '.arating',
      singleSelect: true,
      grouped: false,
      indexBar: false,
      store: userDishStore,
      loadingText: "Loading...",
      scroll: false,
      clearSectionOnDeactivate:true,
      listeners: {
        itemtap:  function(dataView, index, item, e) {
          var record = userDishStore.getAt(index);
          setupBackStack(userProfilePnl);
          Crave.show_menu_item(record.data.menu_item_id);
        }
      },
      plugins: [new Ext.plugins.ListPagingPlugin()]
  });

  

  var savedDishList = null;
  var savedDishStore = null;
  if (mine) {
    savedDishList = new Ext.Panel({
      html: "Nothing to see here"
    });
  } else {
    savedDishStore = new Ext.data.Store({
      model: 'savedDish',
      clearOnPageLoad: false,
      sorters: [{
        property: 'rating', 
        direction: 'DESC'
      }],
      getGroupString : function(record) {
        try {
          var rating = parseInt(record.data.menu_item.menu_item_avg_rating_count.avg_rating);
          return Crave.ratingDisplay(rating);
        } catch (ex) {
          return "Unrated"
        }
      },
      proxy: {
        type:'ajax',
        url:'',
        reader: {
          type:'json',
          model: 'savedDish',
          record:'user_saved_menu_item'
        }
      }
    });
    savedDishList = new Ext.List({
      itemTpl: Crave.savedDishTemplate,
      itemSelector: '.adish',
      singleSelect: true,
      grouped: true,
      indexBar: false,
      store: savedDishStore, //dishes.js
      scroll:'vertical',
      cls: 'magic-scroll',
      hideOnMaskTap: false,
      width:'100%',
      height:'100%',
      clearSectionOnDeactivate:true,
      listeners: {
        itemtap: function(dataView, index, item, e) {
          var dish_id = savedDishStore.getAt(index).data.menu_item.id;
          setupBackStack(savedDishList);
          Crave.show_menu_item(dish_id);
        }
      },
      plugins: [new Ext.plugins.ListPagingPlugin()]
    });
  }

  var followerStore = new Ext.data.Store({
    model: "FollowUser",
    clearOnPageLoad: false,
    autoLoad: false,
    sorters: [{
      sorterFn: function(o1, o2) {
        var user1 = o1.data.user || o1.data.following_user.user;
        var user2 = o2.data.user || o2.data.following_user.user;
        
        var v1 = user1.user_name[0].toUpperCase();
        var v2 = user2.user_name[0].toUpperCase();

        return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
      }
    }],
    proxy: {
      type:'ajax',
      extraParams: {},
      url: '',
      reader: {
        type:'json',
        model: 'FollowUser',
        record: 'user_following'
      }
    },
    getGroupString : function(record) {
      var user = record.data.user || record.data.following_user.user
      return user.user_name[0].toUpperCase();
    }
  });
  var followTemplate = Ext.XTemplate.from('followUserTemplate', {
    get_user: function(values) {
      return values.user || values.following_user.user;
    }
  });
  
  //people who follow me
  var followerList = new Ext.List({
    itemTpl: followTemplate,
    itemSelector: '.followUser',
    singleSelect: true,
    grouped: true,
    profile_panel_title: "Followers",
    cls: 'followList',
    data: {user: {}},
    cardSwitchAnimation: 'pop',
    indexBar: false,
    store: followerStore,
    loadingText: "Loading...",
    scroll:'vertical',
    hideOnMaskTap: false,
    clearSectionOnDeactivate:true,
    listeners: {
      itemtap: function(dataView, index, item, e) {
        var record = followerStore.getAt(this.displayIndexToRecordIndex(index));
        setupBackStack(followerList);
        Crave.show_user_profile(record.data.user_id);
      },
      activate: function() {
        if (mine) {
          settingsButton.hide();
        }
        followerStore.proxy.url = "/users/" + profilePnl.displayed_user_id + "/followers.json";
        followerStore.load();
      }
    },
    plugins: [new Ext.plugins.ListPagingPlugin()]
  });

  //people i'm following
  var followingList = new Ext.List({
    itemTpl: followTemplate,
    profile_panel_title: "Following",
    cls: 'followList',
    itemSelector: '.followUser',
    loadingText: "Loading...",
    singleSelect: true,
    grouped: true,
    data: {user: {}},
    cardSwitchAnimation: 'pop',
    indexBar: false,
    store: followerStore,
    scroll:'vertical',
    hideOnMaskTap: false,
    clearSectionOnDeactivate:true,
    listeners: {
      itemtap: function(dataView, index, item, e) {
        var record = followerStore.getAt(this.displayIndexToRecordIndex(index));
        setupBackStack(followingList);
        Crave.show_user_profile(record.data.following_user_id);
      },
      activate: function() {
        if (mine) {
          settingsButton.hide();
        }
        followerStore.proxy.url = "/users/" + profilePnl.displayed_user_id + "/following.json";
        followerStore.load();
      }
    },
    plugins: [new Ext.plugins.ListPagingPlugin()]
  });

  var profilePnl = null;
  var userInfoPanel = new Ext.Panel({
    xtype: 'panel',
    html: '<div class="userTopPnl"></div>',
    height: 140,
    width:'100%',
    dockedItems: [{
      xtype: 'toolbar',
      cls: 'profileToolbar',
      ui:'normal',
      height: 40,
      dock: 'bottom',
      layout:{
        pack:'start'
      },
      items: [{
        flex: 1,
        text: "<span class='chevrony'></span><span class='number saved'></span><span class='text'>Saved</span>",
        handler: function() {
          if (mine) {
            Crave.viewport.setActiveItem(Crave.savedPanel, {type: 'slide', direction: 'right'});
          } else {
            profilePnl.setActiveItem(savedDishList, 'pop');
            Crave.back_stack.push({
              fn: function() {
                profilePnl.setActiveItem(userProfilePnl, 'pop');
                if (Crave.back_stack.length === 0) {
                  backButton.hide();
                }
              }
            });
            backButton.show();
          }
        }
      },{
        flex: 1,
        text: "<span class='chevrony'></span><span class='number following'></span><span class='text'>Following</span>",
        handler: function() {
          Crave.back_stack.push({
            fn: function() {
              profilePnl.setActiveItem(userProfilePnl, 'pop');
              if (Crave.back_stack.length === 0) {
                backButton.hide();
              }
            }
          });
          profilePnl.setActiveItem(followingList, 'pop');
          backButton.show();
        }
      },{
        flex: 1,
        text: "<span class='chevrony'></span><span class='number followers'></span><span class='text'>Followers</span>",
        handler: function() {
          Crave.back_stack.push({
            fn: function() {
              profilePnl.setActiveItem(userProfilePnl, 'pop');
              if (Crave.back_stack.length === 0) {
                backButton.hide();
              }
            }
          });
          profilePnl.setActiveItem(followerList, 'pop');
          backButton.show();
        }
      },]
    }]
  });


  //This panel is for any user profiles (including the current user)
  var userProfilePnl = new Ext.Panel({
    items: [userInfoPanel,userDishList],
    layout: {
      type: 'vbox'
    },
    cls: 'magic-scroll',
    scroll: 'vertical',
    height:'100%',
    width:'100%',
    listeners: {
      activate: function() {
        userDishList.refresh();  //herp derp
        if (mine) {
          settingsButton.show();
        }
      }
    }
  });

  var profileLoginPnl = Crave.buildLoginPanel();

  var backButton = new Ext.Button({
    text: "Back",
    hidden: !!mine,
    ui: 'iback',
    handler: Crave.back_handler
  });

  var settingsButton = new Ext.Button({
    text:'Settings',
    hidden: !(mine && Crave.isLoggedIn()),
    ui:'normal',
    handler: function(b,e) {
      Crave.viewport.setActiveItem(Crave.settingsPanel, {type: 'slide', direction: 'left'});
      Crave.back_stack.push({
        panel: profilePnl, 
        anim: {
          type: 'slide', 
          direction: 'right'
        }
      });
    }
  });

  profilePnl = new Ext.Panel({
    title:'Me',
    iconCls:'me',
    layout: 'card',
    items:[profileLoginPnl, userProfilePnl, savedDishList, followerList, followingList],
    height:'100%',
    width:'100%',
    activeItem: Crave.isLoggedIn() ? 1 : 0,
    dockedItems: Crave.create_titlebar({
      items:[backButton, {
         xtype : 'spacer'
      },settingsButton]
    }),
    listeners: {
      cardswitch: function(p, newCard, oldCard) {
        p.set_title(newCard.profile_panel_title);
      },
      activate: function(p) {
        if (mine) {
          if (!Crave.isLoggedIn()){
            p.setActiveItem(profileLoginPnl, false);
            settingsButton.hide();
          } else { 
            //make sure the user data is loaded
            //this will do nothign on subsequest calls
            p.load_user_data(Crave.currentUserId());
          }
        }

        //proxy this event so that the settings button gets shown and hidden appropriately
        p.getActiveItem().fireEvent('activate');
      }
    },
    set_title: function(title) {
      profilePnl.dockedItems.get(0).set_title(title);
    },
    load_user_data: function(user_id) {
      if (profilePnl.displayed_user_id === user_id) {
        return;
      }
      profilePnl.setActiveItem(userProfilePnl, 'pop');
      userProfilePnl.scroller.scrollTo({x: 0, y: 0});
      profilePnl.setLoading(true);
      //load basic info
      Ext.Ajax.request({
        method: "GET",
        url: '/users/' + user_id + '.json',
        params: {
          current_user_id: Crave.currentUserId()
        },
        success: function(response, options) {
          profilePnl.setLoading(false);
          profilePnl.setActiveItem(userProfilePnl, 'pop');
          userProfilePnl.scroller.scrollTo({x: 0, y: 0});
          profilePnl.displayed_user_id = user_id;
          var user = Ext.decode(response.responseText).user;
          var html = '<div class="userTopPnl"><div class="userPic">';
          html = html + '<img onload="Crave.squareFitImage(this);" src="'+user.user_profile_pic_url+'?type=large"></div>'
          html = html + '<div class="userInfo"><div class="userName">' + user.user_name+ '</div>';
          html = html + '<div class="reviewCount">' + user.user_ratings_count + ' reviews</div>';
          if (!mine && Crave.isLoggedIn()) { //can't follow if not logged in yet
            if (user.followed_by_current_user) {
              html = html + '<button onclick="Crave.follow_user_toggle(' + user_id + ', this);" class="follow">Unfollow</button>';
            } else {
              html = html + '<button onclick="Crave.follow_user_toggle(' + user_id + ', this);" class="follow">Follow</button>';
            }
          }
          userInfoPanel.update(html);
          userInfoPanel.el.down('.saved').dom.innerHTML = user.saved_count;
          userInfoPanel.el.down('.following').dom.innerHTML = user.following_count;
          userInfoPanel.el.down('.followers').dom.innerHTML = user.followers_count;
          if (mine) {
            //set up the settings panel if we loaded our own profile, this saves us an ajax call later
            Crave.settingsPanel.set_user(user);
            Crave.savedPanel.set_user(user);
          }
        },
        failure: Crave.handle_failure
      });
      //load reviews
      userDishStore.proxy.url = '/users/' + user_id + "/ratings.json";
      userDishStore.load({
        params: {
          page: 1
        }
      });
      
      if (!mine) {
        savedDishStore.proxy.url = "/users/" + user_id + "/saved.json";
        savedDishStore.load();
      }
    }
  });
  return profilePnl;
};


Crave.follow_user_toggle = function(user_id, button) {
  var following = (button.innerHTML[0] === 'U'); //ghetto
  
  if (following) {
    Ext.Ajax.request({
      method: "DELETE",
      url: '/following.json',
      jsonData:{
        user_following: {
          user_id: Crave.currentUserId(),
          following_user_id: user_id
        }
      },
      failure: Crave.handle_failure,
      success: function(response, options) {
        button.innerHTML = "Follow";
      }
    })
  } else {
    Ext.Ajax.request({
      method: "POST",
      url: '/user_followings.json',
      jsonData:{
        user_following: {
          user_id: Crave.currentUserId(),
          following_user_id: user_id
        }
      },
      failure: Crave.handle_failure,
      success: function(response, options) {
        button.innerHTML = "Unfollow";
      }
    })
  }
};


//this is the main panel for the bottom tabs
Crave.buildSavedPanel = function() {
  var savedDishStore = new Ext.data.Store({
    model: 'savedDish',
    clearOnPageLoad: false,
    autoLoad: Crave.isLoggedIn(),
    sorters: [{
      property: 'rating', 
      direction: 'DESC'
    }],
    getGroupString : function(record) {
      try {
        var rating = parseInt(record.data.menu_item.menu_item_avg_rating_count.avg_rating);
        return Crave.ratingDisplay(rating);
      } catch (ex) {
        return "Unrated"
      }
    },
    proxy: {
      type:'ajax',
      url: Crave.isLoggedIn() ? "/users/" + Crave.currentUserId() + "/saved.json" : "",
      reader: {
        type:'json',
        model: 'savedDish',
        record:'user_saved_menu_item'
      }
    }
  });


  var savedList = new Ext.List({
    itemTpl: Crave.savedDishTemplate,
    itemSelector: '.adish',
    singleSelect: true,
    grouped: true,
    indexBar: false,
    store: savedDishStore,
    scroll:'vertical',
    cls: 'magic-scroll',
    hideOnMaskTap: false,
    clearSectionOnDeactivate:true,
    listeners: {
      itemtap: function(dataView, index, item, e) {
        var dish_id = savedDishStore.getAt(index).data.menu_item.id;
        Crave.back_stack.push({
          panel: Crave.savedPanel
        });
        Crave.show_menu_item(dish_id);
      }
    },
    plugins: [new Ext.plugins.ListPagingPlugin()]
  });

  var savedLoginPanel = Crave.buildLoginPanel();
  
  Crave.savedPanel = new Ext.Panel({
    layout: 'card',
    width: '100%',
    height: '100%',
    activeItem: Crave.isLoggedIn() ? 0 : 1,
    dockedItems: Crave.create_titlebar({}),
    items: [savedList, savedLoginPanel],
    listeners: {
      activate: function(p) {
        if (!Crave.isLoggedIn()) {
          Crave.savedPanel.setActiveItem(savedLoginPanel);
        } else {
          Crave.savedPanel.setActiveItem(savedList);
        }
      }
    },
    set_user: function(user) {
      savedDishStore.proxy.url = "/users/" + user.id + "/saved.json";
      savedDishStore.load();
    }
  });
  
  return Crave.savedPanel;
};


Crave.squareFitImage = function(img) {
  if (img.width > img.height) {
    img.style.height = "100px";
    img.style.width = "";
  } else {
    img.style.width = "100px";
    img.style.height = "";
  }
}


Crave.facebookLogin = function() { 
  if (Crave.phonegap) {
    /* On Facebook Login */
    var my_client_id  = "207859815920359",
    my_redirect_uri   = "http://getcrave.com/mobile/uid/",
    my_type           = "user_agent",
    my_display        = "touch"

    var client_browser = ChildBrowser.install(); 
    client_browser.onLocationChange = function(loc){
      //once facebook redirects back to getcrave.com, that will redirect to the mobile page that sets the uid
      //we want to grab that uid out of the request and close the browser because that's all we need here
      var match = /mobile\/uid\/\?uid=(\d+)/.exec(loc);
      if (match) { 
         var uid = match[1];
         localStorage.setItem('uid', uid);
         Crave.myProfilePanel.load_user_data(uid);
         
         //TODO: go back to whatever called the login thing?
         client_browser.close();
      }  
    };
    if(client_browser != null) {
      window.plugins.childBrowser.showWebPage("http://getcrave.com/auth/facebook?redirect_to=mobile");
    }
  } else {
    location.href = "http://getcrave.com/auth/facebook";
  }
}

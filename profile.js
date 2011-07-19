var userDishStore = new Ext.data.Store({
    model: 'MenuItemRating',
    clearOnPageLoad: false,
    proxy: {
      type:'ajax',
      extraParams: {},
      url: '',
      reader: {
        type:'json',
        record:'menu_item_rating'
      }
    },
    sorters: [{property: 'rating', direction: 'DESC'}],
    getGroupString : function(record) {
        var rating = parseInt(record.get('rating'));
        return Crave.ratingDisplay(rating);
    }
});

var userDishList = new Ext.List({
    itemTpl: new Ext.XTemplate.from('profileRatingTemplate'),
    itemSelector: '.arating',
    singleSelect: true,
    grouped: true,
    indexBar: false,
    store: userDishStore,
    loadingText: undefined,
    id:'userDishList',
    scroll: false,
    clearSectionOnDeactivate:true,
    listeners: {
      itemtap:  function(dataView, index, item, e) {
        var record = userDishStore.getAt(index);
        Crave.show_menu_item(record.data.id);
      }
    },
    plugins: [new Ext.plugins.ListPagingPlugin()]
});


var savedDishStore = new Ext.data.Store({
    model: 'savedDish',
    clearOnPageLoad: false,
    sorters: [{property: 'rating', direction: 'DESC'}],
    getGroupString : function(record) {
      try {
        var rating = parseInt(record.data.menu_item.menu_item_avg_rating_count.avg_rating);
        return Crave.ratingDisplay(rating);
      } catch (ex) {
        return "unrated"
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


var savedDishList = new Ext.List({
  itemTpl: Ext.XTemplate.from(savedDishTemplate),
  itemSelector: '.adish',
  singleSelect: true,
  grouped: true,
  indexBar: false,
  store: savedDishStore, //dishes.js
  id:'savedList',
  scroll:'vertical',
  hideOnMaskTap: false,
  width:'100%',
  height:'100%',
  clearSectionOnDeactivate:true,
  listeners: {
    itemtap: function(dataView, index, item, e) {
      var dish_id = savedDishStore.getAt(index).data.menu_item.id;
      Crave.show_menu_item(dish_id);
    }
  },
  plugins: [new Ext.plugins.ListPagingPlugin()]
});

var followerStore = new Ext.data.Store({
  model: "FollowUser",
  clearOnPageLoad: false,
  autoLoad: false,
  sorters: [{property: 'user.user_name', direction: 'ASC'}],
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
  cls: 'followList',
  data: {user: {}},
  indexBar: false,
  store: followerStore, //dishes.js
  id:'followerList',
  scroll:'vertical',
  hideOnMaskTap: false,
  clearSectionOnDeactivate:true,
  listeners: {
    itemtap: function(dataView, index, item, e) {
      var record = followerStore.getAt(this.displayIndexToRecordIndex(index));
      Crave.show_user_profile(record.data.user_id);
    }
  },
  plugins: [new Ext.plugins.ListPagingPlugin()]
});

//people i'm following
var followingList = new Ext.List({
  itemTpl: followTemplate,
  cls: 'followList',
  itemSelector: '.followUser',
  singleSelect: true,
  grouped: true,
  data: {user: {}},
  indexBar: false,
  store: followerStore, //dishes.js
  id:'followingList',
  scroll:'vertical',
  hideOnMaskTap: false,
  clearSectionOnDeactivate:true,
  listeners: {
    itemtap: function(dataView, index, item, e) {
      var record = followerStore.getAt(this.displayIndexToRecordIndex(index));
      Crave.show_user_profile(record.data.following_user_id);
    }
  },
  plugins: [new Ext.plugins.ListPagingPlugin()]
});

//This panel is for any user profiles (including the current user)
var userProfilePnl = new Ext.Panel({
    items: [{
      xtype: 'panel',
      id: 'userInfoPnl',
      html: '<div class="userTopPnl"><div class="userPic"></div><div class="userInfoPnl"><div class="profileUsername"></div><div class="reviewCount"></div></div></div>',
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
          text: "<span class='chevrony'></span><span class='number' id='savedNumber'></span><span class='text'>Saved</span>",
          handler: function() {
            profilePnl.setActiveItem(savedDishList);
            Ext.getCmp('backToProfileButton').show();
          }
        },{
          flex: 1,
          text: "<span class='chevrony'></span><span class='number' id='followingNumber'></span><span class='text'>Following</span>",
          handler: function() {
            followerStore.proxy.url = "/users/" + profilePnl.displayed_user_id + "/following.json";
            followerStore.load();
            profilePnl.setActiveItem(followingList);
            Ext.getCmp('backToProfileButton').show();
          }
        },{
          flex: 1,
          text: "<span class='chevrony'></span><span class='number' id='followersNumber'></span><span class='text'>Followers</span>",
          handler: function() {
            followerStore.proxy.url = "/users/" + profilePnl.displayed_user_id + "/followers.json";
            followerStore.load();
            profilePnl.setActiveItem(followerList);
            Ext.getCmp('backToProfileButton').show();
          }
        },]
      }]
    },userDishList],
    layout: {
      type: 'vbox'
    },
    scroll: 'vertical',
    id: 'userProfilePnl',
    height:'100%',
    width:'100%',
    listeners: {
      activate: function() {
        userDishList.refresh();  //herp derp
      }
    },
    load_user_data: function(user_id) {
      if (profilePnl.displayed_user_id === user_id) {
        return;
      }
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
          var is_self = user_id === localStorage.getItem('uid')
          profilePnl.displayed_user_id = user_id;
          var user = Ext.decode(response.responseText).user;
          var html = '<div class="userTopPnl"><div class="userPic">';
          html = html + '<img src="'+user.user_profile_pic_url+'?type=large"></div>'
          html = html + '<div class="userInfo"><div class="userName">' + user.user_name+ '</div>';
          html = html + '<div class="reviewCount">' + user.user_ratings_count + ' reviews</div>';
          if (!is_self && isLoggedIn()) { //can't follow if not logged in yet
            html = html + '<button id="followButton" onclick="Crave.follow_user(' + user_id + ');" class="follow"><b>+</b> Follow</button>';
          }
          Ext.getCmp('userInfoPnl').update(html);
          
          $("#savedNumber")[0].innerHTML = user.saved_count;
          $("#followingNumber")[0].innerHTML = user.following_count;
          $("#followersNumber")[0].innerHTML = user.followers_count;
          if (is_self) {
            //set up the settings panel if we loaded our own profile, this saves us an ajax call later
            Crave.settingsPanel.set_user(user);
            Ext.getCmp('profileSettingsButton').show();
          } else {
            Crave.remove_tabbar_highlight();
            Ext.getCmp('profileSettingsButton').hide();
          }
        },
        failure: Ext.createDelegate(Crave.handle_failure, mainPnl)
      });
      //load reviews
      userDishStore.proxy.url = '/users/' + user_id + "/ratings.json";
      userDishStore.load({
        params: {
          page: 1
        }
      });
      savedDishStore.proxy.url = "/users/" + user_id + "/saved.json";
      savedDishStore.load();
    }
});

profileLoginPnl = new Ext.Panel({
  html:'<div class="fancyImage"><img class="logoutButton" src="../images/profile-cold-food.png"></div><div class="explanation">Rate & Save Dishes, Follow Foodies</div><a href="/auth/facebook" class="loginButton"></a>',
  id: 'profileLoginPnl',
  scroll:'vertical'
});

var profilePnl = new Ext.Panel({
  title:'Me',
  iconCls:'me',
  layout: 'card',
  items:[profileLoginPnl, userProfilePnl, savedDishList, followerList, followingList, Crave.buildSettingsPanel()],
  id: 'profilePnl',
  height:'100%',
  width:'100%',
  activeItem: isLoggedIn() ? 0 : 1,
  dockedItems: Crave.create_titlebar({
    items:[{
      text: "Back",
      pressed: true,
      hidden: true,
      id: "backToProfileButton",
      ui: 'back',
      handler: function(btn) {
        var anim = profilePnl.cardSwitchAnimation;
        if (profilePnl.getActiveItem() === Crave.settingsPanel) {
          //if we're coming back from the settings panel
          anim = {type: 'slide', direction: 'right'};
          Ext.getCmp('profileSettingsButton').show();  
        }
        profilePnl.setActiveItem(userProfilePnl, anim);
        btn.hide();
        
      }
    },{
       xtype : 'spacer'
    },{
      text:'Settings',
      hidden: true,
      id: 'profileSettingsButton',
      ui:'normal',
      handler: function(b,e) {
        profilePnl.setActiveItem(Crave.settingsPanel, 'slide');
        Ext.getCmp('backToProfileButton').show();
        b.hide();
      }
    }]
  }),
  cardSwitchAnimation: 'pop',
  direction:'horizontal',
  activate: function(p) {
    userDishList.refresh();  //herp derp
  }
});




Crave.follow_user = function(user_id) {
  //TODO: actually follow somebody
  $("#followButton")[0].innerHTML = "- Unfollow";
}
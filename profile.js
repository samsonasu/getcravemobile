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
    sorters: [{property: 'arating', direction: 'DESC'}],
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
    id:'userDishList',
    scroll:'vertical',
    height: 200,
    flex: 1,
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

//This panel is for any user profiles (including the current user)
var userProfilePnl = new Ext.Panel({
    items:[{
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
          text: "<span class='chevrony'></span><span class='number' id='savedNumber'>142</span><span class='text'>Saved</span>",
          handler: function() {
            profilePnl.setActiveItem(savedDishList);
          }
        },{
          flex: 1,
          text: "<span class='chevrony'></span><span class='number' id='followingNumber'>115</span><span class='text'>Following</span>",
          handler: function() {
            alert('clicky');
          }
        },{
          flex: 1,
          text: "<span class='chevrony'></span><span class='number' id='followersNumber'>481</span><span class='text'>Followers</span>",
          handler: function() {
            alert('clicky');
          }
        },]
      }]
    },userDishList],
    layout: {
      type: 'vbox'
    },
    id: 'userProfilePnl',
    height:'100%',
    width:'100%',
    displayed_user_id: null,
    load_user_data: function(user_id) {
      if (this.displayed_user_id === user_id) {
        return;
      }
      profilePnl.setLoading(true);
      //load basic info
      Ext.Ajax.request({
        method: "GET",
        url: '/users/' + user_id + '.json',
        success: function(response, options) {
          profilePnl.setLoading(false);
          var is_self = user_id === localStorage.getItem('uid')
          var user = Ext.decode(response.responseText).user;
          var html = '<div class="userTopPnl"><div class="userPic">';
          html = html + '<img src="'+user.user_profile_pic_url+'?type=large" width="100" height="100"></div>'
          html = html + '<div class="userInfo"><div class="userName">' + user.user_name+ '</div>';
          html = html + '<div class="reviewCount">' + user.user_ratings_count + ' reviews</div>';
          if (!is_self && isLoggedIn()) { //can't follow if not logged in yet
            html = html + '<button id="followButton" onclick="Crave.follow_user(' + user_id + ');" class="follow">+ Follow</button>';
          }
          Ext.getCmp('userInfoPnl').update(html);
          Ext.getCmp('signOutButton').setVisible(is_self);
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

Crave.follow_user = function(user_id) {
  //TODO: actually follow somebody
  $("#followButton")[0].innerHTML = "- Unfollow";
}

profileLoginPnl = new Ext.Panel({
  html:'<div class="fancyImage"><img class="logoutButton" src="../images/profile-cold-food.png"></div><div class="explanation">Rate & Save Dishes, Follow Foodies</div><a href="/auth/facebook" class="loginButton"></a>',
  id: 'profileLoginPnl',
  scroll:'vertical'
});

var profilePnl = new Ext.Panel({
  title:'Me',
  iconCls:'me',
  layout: 'card',
  items:[profileLoginPnl, userProfilePnl, savedDishList],
  id: 'profilePnl',
  height:'100%',
  width:'100%',
  activeItem: 0,
  dockedItems:[{
    dock:'top',
    xtype:'toolbar',
    ui:'light',
    title:'<img class="cravelogo" src="../images/crave-logo-horizontal-white.png">',
    items:[{
      text:'Sign Out',
      id:'signOutButton',
      hidden: !isLoggedIn(),
      ui:'normal',
      handler: function(b,e) {
        Crave.sign_out();
        this.hide();
        profilePnl.setActiveItem(0);
      }
    }]
  }],
  cardSwitchAnimation: 'pop',
  direction:'horizontal'
});
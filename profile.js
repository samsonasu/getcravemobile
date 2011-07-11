var loggedoutProfilePnl = new Ext.Panel({
    html:'<div class="fancyImage"><img class="logoutButton" src="../images/profile-cold-food.png"></div><div class="explanation">Rate & Save Dishes, Follow Foodies</div><a href="/auth/facebook" class="loginButton"></a>',
    id: 'loggedoutProfilePnl',
    scroll:'vertical'
});

Ext.regModel('User',
{
    fields: ['user_name']
});

Ext.regModel('MyRatings',
{
    fields: ['id','review','menu_item_id','rating','name','restaurant_name']
});

var myDishStore = new Ext.data.Store({
    model: 'MyRatings',
    sorters: [{property: 'arating', direction: 'DESC'}],
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
    }
});

reviewTemplate = new Ext.XTemplate.from('reviewDishTemplate');

var myDishList = new Ext.List({
    itemTpl: reviewTemplate,
    itemSelector: '.adish',
    singleSelect: true,
    grouped: true,
    indexBar: false,
    store: myDishStore,
    id:'myDishList',
    scroll:'vertical',
    width:'100%',
    height:300,
    hideOnMaskTap: false,
    clearSectionOnDeactivate:true
});
myDishList.on('itemtap', function(dataView, index, item, e) {
    console.log($(".dishname", item).text());
    thisId = myDishStore.findRecord("name",$(".dishname", item).text()).data.id;
    console.log(thisId);
    Ext.Ajax.request({
        url: (urlPrefix+'/items/'+thisId+'.json'),
        reader: {
             type: 'json'
        },
        success: function(response) {
            dishDisplay(response);
        }
    });
    Ext.getCmp('mainPnl').setActiveItem(0);
});

var blankPnl = new Ext.Panel({
    html:'',
    id: 'profileInfoPnl',
    height:'100%',
    width:'100%'
});

var myDishListPnl = new Ext.Panel({
    items:[myDishList,blankPnl],
    id: 'myDishListPnl',
    layout: {
        type: 'card'
    },
    width:'100%',
    height:'100%'
});


var profileInfoPnl = new Ext.Panel({
    html:'<div class="userTopPnl"><div class="userPic"></div><div class="userInfoPnl"><div class="profileUsername"></div><div class="reviewCount"></div></div></div>',
    id: 'profileInfoPnl',
    height:100,
    width:'100%'
});

var loggedinProfilePnl = new Ext.Panel({
    items:[profileInfoPnl,myDishList],
    layout: {
        type: 'vbox',
        align: 'start',
        direction: 'normal'
    },
    id: 'loggedinProfilePnl',
    height:'100%',
    width:'100%'
});

var signoutHandler = function(b,e) {
    if(b.getText() == "Sign Out") {
        localStorage.setItem("uid","");
        $("#signOutButton").css("display","none");

        Ext.getCmp("profilePnl").setActiveItem(1);
    }
}

var profilePnl = new Ext.Panel({
    items:[blankPnl,loggedoutProfilePnl,loggedinProfilePnl],
    id: 'profilePnl',
    height:'100%',
    width:'100%',
    layout: 'card',
    activeItem:0,
    dockedItems:[
        {
            dock:'top',
            xtype:'toolbar',
            ui:'light',
            title:'<img class="cravelogo" src="../images/crave-logo-horizontal-white.png">',
            items:[{text:'Sign Out',id:'signOutButton',ui:'normal', handler:signoutHandler}]
        }
    ],
    cardSwitchAnimation: 'pop',
    direction:'horizontal'
});

profilePnl.on('afterrender', function() {
    //this is not even being called a tall now
    console.log('am i logged in? '+isLoggedIn());
    var loggedIn = isLoggedIn();
    if(loggedIn) {
        console.log('setting as logged in');
        profilePnl.setActiveItem(2);
    } else {
        profilePnl.setActiveItem(1);
        console.log('set profilePnl to 1');
    }
    
});
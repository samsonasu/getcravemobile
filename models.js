/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

//from dishes.js

Ext.regModel('Dish',
{
    fields: ['name','id','price','description','restaurant_id','restaurant',
      'distance','menu_item_avg_rating_count','avg_rating', 'count', 'menu_item_photos',
      {
        name: 'rating',
        convert: function(value, record) {
            if(record.get('menu_item_avg_rating_count').avg_rating) {
                return record.get('menu_item_avg_rating_count').avg_rating.toString();
            } else {
                return "Unrated";
            }
        }
      },{
        name: 'rating_count',
        convert: function(value, record) {
            if(record.get('menu_item_avg_rating_count').count) {
                if(record.get('menu_item_avg_rating_count').count.toString()=="1") {
                    return record.get('menu_item_avg_rating_count').count.toString()+" review";
                } else {
                    return record.get('menu_item_avg_rating_count').count.toString()+" reviews";
                }
            } else {
                return "";
            }
        }
    }]
});

Ext.regModel('savedDish',
{
    fields: ['menu_item']
});

Crave.dishTemplateConfig = {
  distDisplay: function(miles) {
    if (miles === undefined) {
      return "";
    }
    var feet = Math.round(miles * 5280);
    if(feet<1000) {
      return feet+" feet";
    } else {
      return parseFloat(miles).toFixed(1)+' miles';
    }
  },
  //right now this just grabs the first image
  photo_url: Crave.photo_url,
  render_dish: function(menu_item) {
    return Crave.dishTemplate.apply(menu_item);
  }
};

Crave.dishTemplate = new Ext.XTemplate.from('dishesTemplate', Crave.dishTemplateConfig);

Crave.savedDishTemplate = Ext.XTemplate.from("savedDishTemplate", Crave.dishTemplateConfig);

Ext.regModel('Restaurant', {
  fields: ['city', 'distance', 'name', 'id', 'country', 'created_at', 'state', 'street_address', 'telephone', 'twitter', 'zip']
});

Ext.regModel('User', {
  fields: ['facebook_id', 'id', 'user_ratings_count', 'user_profile_pic_url', 'user_name', 'twitter_id']
});

Ext.regModel('FollowUser', {
  fields: ['user_name', 'id', 'user_id', 'following_user_id', 'user', "following_user"]
});

//activity.js

Ext.regModel("MenuItemRating", {
  fields: ["user", "rating", "created_at", "updated_at", "review", "id", "user_id", "menu_item_id", 'menu_item']
});

Ext.regModel('DishSearch',
{
  fields: ['name','id','price','description','restaurant_id']
});


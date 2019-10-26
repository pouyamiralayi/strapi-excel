'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async deletePost(ctx){
    const final =  JSON.parse(ctx.request.body["id"])
    if(final.length > 0){
      return await Promise.all(final.map(id => strapi.services.customer.delete({id})));
    }
  }
};

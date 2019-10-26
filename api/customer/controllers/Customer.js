'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async deletePost(ctx){
    console.log(ctx.request.body)
    if(Array.isArray(ctx.request.body)){
      return await Promise.all(ctx.request.body.map(strapi.services.customer.delete));
    }
    else {
      return strapi.services.customer.delete(ctx.request.body)
    }
  }
};

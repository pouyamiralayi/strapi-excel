'use strict';
const _ = require('lodash')
/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async deletePost(ctx){
    // return ctx.request.body
    const ids = ctx.request.body['id'].toJSON ? ctx.request.body['id'].toJSON() : ctx.request.body['id']
    const idsArray = ids.split(',')
    let firstIdx = null
    let lastIdx = null
    try{
      firstIdx = idsArray[0].split('[')[1]
    }
    catch (e) {
      console.log(e)
    }
    try{
      lastIdx = idsArray[idsArray.length - 1].split(']')[0]
    }
    catch (e) {
      console.log(e)
    }
    const newIds = [firstIdx, ...idsArray.slice(1,idsArray.length - 1), lastIdx]
    const trimmed = _.map(newIds, _.trim)
    const final = _.map(trimmed, _.toInteger)
    // return final
    if(final.length > 0){
        return await Promise.all(final.map(id => strapi.services.seller.delete({id})));
    }
  }
};

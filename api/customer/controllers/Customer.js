'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */
const {convertRestQueryParams} = require('strapi-utils');
const _ = require('lodash')

module.exports = {
  async deletePost(ctx) {
    const final = JSON.parse(ctx.request.body["id"])
    if (final.length > 0) {
      return await Promise.all(final.map(id => strapi.services.customer.delete({id})));
    }
  },
  async owed(ctx) {
    const filters = convertRestQueryParams(ctx.request.query);
    var customer_no = null
    filters && filters.where && filters.where.forEach(f => {
      if (f && f.field && f.field === "customer_no") {
        if (f.value) {
          customer_no = f.value
        }
      }
    })
    const query = {customer_no}
    const params = ['description_contains', 'date_gte', 'date_lt']
    for (const p of params) {
      if (p in ctx.request.query) {
        query[p] = ctx.request.query[p]
      }
    }
    const customers_count = await strapi.services.customer.count(query)
    const total_customers = Math.ceil(customers_count / 100)
    let owed = 0
    let owned = 0
    let rem = 0
    for (let i = 0; i < total_customers; i++) {
      query['_start'] = i * 100
      const customers = await strapi.services.customer.find(query)
      for (const c of customers) {
        try {
          if (c.owed != null && c.owed) {
            owed += _.toNumber(c.owed)
          }
        } catch (e) {
          console.log(e)
        }
        try {
          if (c.owned != null && c.owned) {
            owned += _.toNumber(c.owned)
          }
        } catch (e) {
          console.log(e)
        }
      }
    }
    try {
      rem = owned - owed
    } catch (e) {
      console.log(e)
    }
    return ctx.send({
      owed: owed.toString(),
      owned: owned.toString(),
      rem: Math.abs(rem).toString(),
      plus: rem >= 0 ? true : false
    })
  }
};

'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */
const moment = require('moment-jalaali')
const XLSX = require('xlsx')
const {convertRestQueryParams} = require('strapi-utils');
const path = require('path')
const axios = require('axios')
module.exports = {
  updatehook: async (ctx) => {
    const filters = convertRestQueryParams(ctx.request.query);
    var file_id = null
    var excel_id = null
    // await ctx.send(filters)
    // extracting files id from request
    filters && filters.where && filters.where.forEach(f => {
      if (f && f.field && f.field === "file_id") {
        if (f.value) {
          file_id = f.value
        }
      }
    })
    // extracting excel id from request
    filters && filters.where && filters.where.forEach(f => {
      if (f && f.field && f.field === "id") {
        if (f.value) {
          excel_id = f.value
        }
      }
    })
    // await ctx.send(file_id)
    if (file_id === null) return
    if (excel_id === null) return
    const file_ids = file_id.split(',')
    const file_urls = []
    // await ctx.send(splitted)
    const defaultRole = await strapi
      .query('role', 'users-permissions')
      .findOne({type: 'authenticated'}, []);
    // await ctx.send(defaultRole)
    const excel = await strapi.services.excel.findOne({id: excel_id})
    excel && excel.excel_file && excel.excel_file.forEach(f => {
      /*FIXME f.id is integer, file_ids contains strings! be careful!*/
      if (f && f.id && file_ids.includes(f.id.toString())) {
        f.url && file_urls.push(f.url)
      }
    })
    // await ctx.send({excel, file_ids, file_urls})
    for (const url of file_urls) {
      const data_customer = [];
      const data_seller = [];
      const data_auth = [];
      const workbook = XLSX.readFile(path.join(__dirname, '..', '..', '..', 'public', url), {sheetStubs: true});
      const sheet_name_list = workbook.SheetNames;
      for (const y of sheet_name_list) {
        if (y === "Sheet1") {
          const worksheet = workbook.Sheets[y];
          const headers = {};
          for (const z in worksheet) {
            if (z[0] === '!') continue;
            let numberPosition = 0;
            for (let i = 0; i < z.length; i++) {
              if (!isNaN(z[i])) {
                numberPosition = i;
                break;
              }
            }
            const col = z.substring(0, numberPosition);
            const row = parseInt(z.substring(numberPosition));
            const value = worksheet[z].v; // .v is XLSX property of parsed worksheet
            if (row === 1) {
              if (col === 'A') {
                headers[col] = "fin_year"
              } else if (col === 'B') {
                headers[col] = "record_no"
              } else if (col === 'C') {
                headers[col] = "date"
              } else if (col === 'D') {
                headers[col] = "customer_no"
              } else if (col === 'E') {
                headers[col] = "customer_name"
              } else if (col === 'F') {
                headers[col] = "description"
              } else if (col === 'G') {
                headers[col] = "owed"
              } else if (col === 'H') {
                headers[col] = "owned"
              }
              continue
            }
            if (!data_customer[row]) data_customer[row] = {};
            data_customer[row][headers[col]] = value || 0;
          }
        }
        if (y === "Sheet2") {
          const worksheet = workbook.Sheets[y];
          const headers = {};
          for (const z in worksheet) {
            if (z[0] === '!') continue;
            let numberPosition = 0;
            for (let i = 0; i < z.length; i++) {
              if (!isNaN(z[i])) {
                numberPosition = i;
                break;
              }
            }
            const col = z.substring(0, numberPosition);
            const row = parseInt(z.substring(numberPosition));
            const value = worksheet[z].v; // .v is XLSX property of parsed worksheet
            if (row === 1) {
              if (col === 'A') {
                headers[col] = "fin_year"
              } else if (col === 'B') {
                headers[col] = "description"
              } else if (col === 'C') {
                headers[col] = "date"
              } else if (col === 'D') {
                headers[col] = "record_no"
              } else if (col === 'E') {
                headers[col] = "expire_date"
              } else if (col === 'F') {
                headers[col] = "seller_no"
              } else if (col === 'G') {
                headers[col] = "seller_name"
              } else if (col === 'H') {
                headers[col] = "product_no"
              } else if (col === 'I') {
                headers[col] = "product"
              } else if (col === 'J') {
                headers[col] = "first_unit"
              } else if (col === 'K') {
                headers[col] = "quantity"
              } else if (col === 'L') {
                headers[col] = "rate"
              } else if (col === 'M') {
                headers[col] = "payment"
              }
              continue
            }
            if (!data_seller[row]) data_seller[row] = {};
            data_seller[row][headers[col]] = value || 0;
          }
        }
        if (y === "Sheet3") {
          const worksheet = workbook.Sheets[y];
          const headers = {};
          for (const z in worksheet) {
            if (z[0] === '!') continue;
            let numberPosition = 0;
            for (let i = 0; i < z.length; i++) {
              if (!isNaN(z[i])) {
                numberPosition = i;
                break;
              }
            }
            const col = z.substring(0, numberPosition);
            const row = parseInt(z.substring(numberPosition));
            const value = worksheet[z].v; // .v is XLSX property of parsed worksheet
            if (row === 1) {
              if (col === 'A') {
                headers[col] = "username"
              } else if (col === 'B') {
                headers[col] = "email"
              } else if (col === 'C') {
                headers[col] = "password"
              }
              continue
            }
            if (!data_auth[row]) data_auth[row] = {};
            data_auth[row][headers[col]] = value || 0;
          }
        }
      }
      for (const customer of data_customer) {
        if (customer === null || customer === undefined) {
          continue
        }
        if (customer.customer_no === null || customer.customer_no === undefined) {
          continue
        }
        if (customer.date !== null && customer.date !== undefined) {
          const formatted = moment(customer.date, 'jYYYY/jMM/jDD')
          if (formatted.isValid()) {
            // console.log(formatted.format('YYYY-M-D HH:mm:ss'))
            customer.date = formatted
          } else {
            customer.date = null
          }
        }
        try {
          const res= await strapi.services.customer.create(customer)
        }
        catch (e) {
          await ctx.send(e)
        }
      }
      for (const seller of data_seller) {
        if (seller === null || seller === undefined) {
          continue
        }
        if (seller.seller_no === null || seller.seller_no === undefined) {
          continue
        }
        if (seller.date !== null && seller.date !== undefined) {
          const formatted = moment(seller.date, 'jYYYY/jMM/jDD')
          if (formatted.isValid()) {
            // console.log(formatted.format('YYYY-M-D HH:mm:ss'))
            seller.date = formatted
          } else {
            seller.date = null
          }
        }
        if (seller.expire_date !== null && seller.expire_date !== undefined) {
          const formatted = moment(seller.expire_date, 'jYYYY/jMM/jDD')
          if (formatted.isValid()) {
            // console.log(formatted.format('YYYY-M-D HH:mm:ss'))
            seller.expire_date = formatted
          } else {
            seller.expire_date = null
          }
        }
        try {
          const res= await strapi.services.seller.create(seller)
        }
        catch (e) {
          await ctx.send(e)
        }
      }
      for (const auth of data_auth) {
        if (auth === null || auth === undefined) {
          continue
        }
        if (auth.username === null || auth.username === undefined) {
          continue
        }
        if (auth.password === null || auth.password === undefined) {
          continue
        }
        if (auth.email === null || auth.email === undefined) {
          continue
        }
        // const params = new URLSearchParams();
        // params.append('username', auth.username);
        // params.append('email', auth.email);
        // params.append('password', auth.password);
        // axios.post('http://localhost:1337/auth/local/register', params)
        //   .then(response => {
        //     console.log(response)
        //   })
        try{
          const res = await strapi.query('user', 'users-permissions').create({
            username: auth.username,
            password: auth.password,
            email: auth.email,
            confirmed: true,
            blocked: false,
            provider: 'local',
            role: defaultRole.id
          })
        }
        catch (e) {
          await ctx.send(e) // {"name": "error","severity": "ERROR","detail": "Key (username)=(420181) already exists.","table": "users-permissions_user",}
        }
        // console.log(res)
      }
      // await ctx.send({data_customer, data_seller, data_auth})
    }
  }
};

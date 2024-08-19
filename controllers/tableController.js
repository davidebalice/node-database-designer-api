const moment = require('moment');
const { Op } = require('sequelize');
const mongoose = require('mongoose');
const Table = require('../models/tableModel');
const Field = require('../models/fieldModel');
const Link = require('../models/linkModel');
const User = require('../models/userModel');
const AppError = require('../middlewares/error');
const catchAsync = require('../middlewares/catchAsync');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

exports.getTables = catchAsync(async (req, res, next) => {
  const database_id = req.query.database_id;

  if (isNaN(database_id)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid database_id parameter',
    });
  }

  const tables = await Table.findAll({
    where: {
      database_id: database_id,
    },
    include: [
      {
        model: Field,
        as: 'fields',
        attributes: ['name'],
      },
    ],
    order: [[{ model: Field, as: 'fields' }, 'order', 'ASC']],
  });

  const links = await Link.findAll({
    where: {
      database_id: database_id,
    },
  });

  let message = '';
  if (req.query.m) {
    if (req.query.m === '1') {
      message = 'Table added';
    } else if (req.query.m === '2') {
      message = 'Table deleted';
    }
  }

  res.status(200).json({
    tables,
    links,
    message,
  });
});

exports.addTable = catchAsync(async (req, res, next) => {
  const clients = await Client.find({}).sort({ companyName: 1 });
  res.status(200).json({
    title: 'Add table',
    owner: res.locals.user._id,
    clients: clients.map((client) => ({
      _id: client._id,
      companyName: client.companyName,
    })),
  });
});

exports.createTable = catchAsync(async (req, res, next) => {
  try {
    req.body._id = new mongoose.Types.ObjectId();
    req.body.owner = res.locals.user._id;
    await Table.create(req.body);

    res.status(200).json({
      title: 'Create table',
      create: 'success',
    });
  } catch (err) {
    res.status(200).json({
      title: 'Create table',
      formData: req.body,
      message: err.message,
    });
  }
});

exports.deleteTable = catchAsync(async (req, res, next) => {
  const doc = await Table.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    title: 'Delete table',
    create: 'success',
  });
});

exports.getTable = catchAsync(async (req, res, next) => {
  const table = await Table.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Field,
        as: 'fields',
      },
    ],
    order: [[{ model: Field, as: 'fields' }, 'order', 'ASC']],
  });

  if (!table) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    table,
  });
});

exports.editTable = catchAsync(async (req, res, next) => {
  const table = await Table.findById(req.params.id);
  if (!table) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    title: 'Edit table',
    table,
  });
});


exports.updateTable = catchAsync(async (req, res, next) => {
  if (global.demo) {
    return res.status(200).json({
      title: 'Demo mode',
      status: 'demo',
    });
  }

  const tableId = req.params.id;
  const { name, fields } = req.body;

  const table = await Table.findByPk(tableId);

  if (!table) {
    return next(new AppError('No document found with that ID', 404));
  }

  if (name) {
    table.name = name;
    await table.save();
  }

  if (fields && Array.isArray(fields)) {
    for (const fieldData of fields) {
      const { id, name, field_type } = fieldData;

      if (id) {
        const field = await Field.findByPk(id);
        if (field) {
          field.name = name || field.name;
          field.field_type = field_type || field.field_type;
          await field.save();
        }
      } else {
        await Field.create({ name, field_type, tableId: table.id });
      }
    }
  }

  res.status(200).json({
    title: 'Update table',
    status: 'success',
    table,
  });
});

exports.updateTables = catchAsync(async (req, res, next) => {
  //console.log(global.demo);

  if (global.demo) {
    res.status(200).json({
      title: 'Demo mode',
      status: 'demo',
    });
  } else {
    const tables = req.body.tables;
    const links = req.body.links;
    const id = req.body.id;

    try {
      for (const tableData of tables) {
        const { x, y } = tableData.position || {};

        console.log('asdfddf');
        console.log(tableData.id);

        let table = await Table.findByPk(tableData.id);
        console.log(table);
        if (table) {
          await table.update({
            name: tableData.name,
            x: x,
            y: y,
          });
        } else {
          console.log('pppooii');
          table = await Table.create({
            name: tableData.name,
            x: x,
            y: y,
            database_id: id,
          });
        }

        for (let index = 0; index < tableData.fields.length; index++) {
          const fieldName = tableData.fields[index];
          /*
          let field = await Field.findByPk(fieldData.id);
          if (field) {
            await field.update({ name: fieldName });
          } else {
            await Field.create({
              name: fieldName,
              order: 1,
              table_id: table.id,
            });
          }*/

          const existingField = await Field.findOne({
            where: {
              name: fieldName,
              table_id: table.id,
            },
          });

          if (!existingField) {
            await Field.create({
              name: fieldName,
              order: 1,
              table_id: table.id,
            });
          }
        }
      }

      for (const linkData of links) {
        let link = await Link.findByPk(linkData.id);
        if (link) {
          await link.update({
            sourceTable: linkData.sourceTable,
            sourceField: linkData.sourceField,
            targetTable: linkData.targetTable,
            targetField: linkData.targetField,
          });
        } else {
          link = await Link.create({
            database_id: id,
            sourceTable: linkData.sourceTable,
            sourceField: linkData.sourceField,
            targetTable: linkData.targetTable,
            targetField: linkData.targetField,
          });
        }
      }

      res.status(200).json({ message: 'Tables update successfully!' });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ message: 'Update error.' });
    }
  }
});

exports.activeTable = catchAsync(async (req, res, next) => {
  const doc = await Table.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
});

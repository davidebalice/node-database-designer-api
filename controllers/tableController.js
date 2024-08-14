const moment = require('moment');
const { Op } = require('sequelize');
const mongoose = require('mongoose');
const Table = require('../models/tableModel');
const Field = require('../models/fieldModel');
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
  const table = await Table.findOne({ slug: req.params.slug });

  if (!table) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
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
  //console.log(global.table);

  if (global.table) {
    res.status(200).json({
      title: 'Demo mode',
      status: 'table',
    });
  } else {
    const doc = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      title: 'Update table',
      status: 'success',
    });
  }
});

exports.updateTables = catchAsync(async (req, res, next) => {
  //console.log(global.table);

  if (global.table) {
    res.status(200).json({
      title: 'Demo mode',
      status: 'table',
    });
  } else {
    const tables = req.body;

    console.log(tables);

    try {
      for (const tableData of tables) {
        const { x, y } = tableData.position || {};
  
        let table = await Table.findByPk(tableData.id);
        if (table) {
          await table.update({
            name: tableData.name,
            x: x,
            y: y
          });
        } else {
          table = await Table.create({
            id: tableData.id,
            name: tableData.name,
            x: x,
            y: y,
            database_id: yourDatabaseId
          });
        }
  
  
        for (const fieldData of tableData.fields) {
          let field = await Field.findByPk(fieldData.id);
          if (field) {
            await field.update({ name: fieldData.name, order: fieldData.order });
          } else {
            await Field.create({
              id: fieldData.id,
              name: fieldData.name,
              order: fieldData.order,
              table_id: table.id
            });
          }
        }
      }
  
      res.status(200).json({ message: 'Tabelle e campi aggiornati con successo!' });
    } catch (error) {
      console.error('Errore durante l\'aggiornamento:', error);
      res.status(500).json({ message: 'Errore durante l\'aggiornamento delle tabelle e dei campi.' });
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
const moment = require('moment');
const { Op } = require('sequelize');
const mongoose = require('mongoose');
const Database = require('../models/databaseModel');
const Table = require('../models/tableModel');
const Field = require('../models/fieldModel');
const Link = require('../models/linkModel');
const User = require('../models/userModel');
const AppError = require('../middlewares/error');
const catchAsync = require('../middlewares/catchAsync');

exports.getTables = catchAsync(async (req, res, next) => {
  let database_id = req.query.database_id;

  if (isNaN(database_id)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid database_id parameter',
    });
  }

  if (parseInt(database_id) === 0) {
    const firstDatabase = await Database.findOne({
      attributes: ['id'],
      order: [['createdAt', 'ASC']],
    });

    if (!firstDatabase) {
      return res.status(404).json({
        status: 'fail',
        message: 'No databases found',
      });
    }

    database_id = firstDatabase.id;
  }

  const tables = await Table.findAll({
    where: {
      database_id: database_id,
    },
    include: [
      {
        model: Field,
        as: 'fields',
        attributes: ['name', 'field_type', 'lenght', 'primary_field', 'ai', 'index_field'],
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
  if (global.demo) {
    return res.status(200).json({
      title: 'Demo mode',
      status: 'demo',
    });
  }
  const tableId = req.params.id;

  const tableDatabaseId = await Table.findByPk(tableId);

  if (!tableDatabaseId) {
    return next(new AppError('No document found with that ID', 404));
  }

  const databaseId = tableDatabaseId.database_id;

  const table = await Table.destroy({ where: { id: tableId } });
  const fields = await Field.destroy({ where: { table_id: tableId } });
  await Link.destroy({
    where: {
      database_id: databaseId,
      [Op.or]: [{ sourceTable: tableDatabaseId.name }, { targetTable: tableDatabaseId.name }],
    },
  });

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
      const { id, name, field_type, lenght, default_value, primary_field, ai, nullable, index_field } = fieldData;

      if (id) {
        const field = await Field.findByPk(id);
        if (field) {
          field.name = name || field.name;
          field.field_type = field_type || field.field_type;
          field.primary_field = primary_field || 0;
          field.lenght = lenght || field.lenght;
          field.default_value = default_value || field.default_value;
          field.ai = ai || 0;
          field.nullable = nullable || 0;
          field.index_field = index_field || 0;
          await field.save();
        }
      } else {
        const maxOrder = await Field.max('order', {
          where: { table_id: table.id },
        });

        const newOrder = maxOrder !== null ? maxOrder + 1 : 1;
        await Field.create({
          name,
          field_type,
          lenght,
          default_value,
          primary_field,
          ai,
          nullable,
          index_field,
          table_id: table.id,
          order: newOrder,
        });
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

        let table = await Table.findByPk(tableData.id);

        if (table) {
          await table.update({
            name: tableData.name,
            x: x,
            y: y,
          });
        } else {
          table = await Table.create({
            name: tableData.name,
            x: x,
            y: y,
            database_id: id,
          });
        }

        for (let index = 0; index < tableData.fields.length; index++) {
          const field = tableData.fields[index];

          const existingField = await Field.findOne({
            where: {
              name: field.name,
              table_id: table.id,
            },
          });

          if (!existingField) {
            await Field.create({
              name: field.name,
              ai: field.ai,
              default_value: field.default_value,
              field_type: field.field_type,
              lenght: field.lenght,
              primary_field: field.primary_field,
              nullable: field.nullable,
              index_field: field.index_field,
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

exports.getSql = catchAsync(async (req, res, next) => {
  let database_id = req.query.database_id;

  if (parseInt(database_id) === 0) {
    const firstDatabase = await Database.findOne({
      attributes: ['id'],
      order: [['createdAt', 'ASC']],
    });

    if (!firstDatabase) {
      return res.status(404).json({
        status: 'fail',
        message: 'No databases found',
      });
    }

    database_id = firstDatabase.id;
  }

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

exports.deleteField = catchAsync(async (req, res, next) => {
  if (global.demo) {
    return res.status(200).json({
      title: 'Demo mode',
      status: 'demo',
    });
  }

  const fieldId = req.params.id;

  const field = await Field.destroy({ where: { id: fieldId } });

  if (!field) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    title: 'Delete field',
    create: 'success',
  });
});

exports.deleteLink = catchAsync(async (req, res, next) => {
  if (global.demo) {
    return res.status(200).json({
      title: 'Demo mode',
      status: 'demo',
    });
  }

  const linkId = req.params.id;

  const link = await Link.destroy({ where: { id: linkId } });

  if (!link) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    title: 'Delete link',
    create: 'success',
  });
});

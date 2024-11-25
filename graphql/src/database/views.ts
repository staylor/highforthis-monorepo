import type { Db, Document } from 'mongodb';

function createPipeline(entityType: string) {
  const lookupTable = `${entityType}_info`;
  const pipeline: Document[] = [
    // shows with attended: true
    {
      $match: {
        attended: true,
      },
    },
  ];
  if (entityType === 'artist') {
    // artists is an array
    pipeline.push({
      $unwind: '$artists',
    });
  }
  pipeline.push(
    // group by _id
    {
      $group: {
        _id: entityType === 'artist' ? '$artists' : '$venue',
        count: {
          $sum: 1,
        },
      },
    },
    // lookup entity in foreign table
    {
      $lookup: {
        from: entityType,
        localField: '_id',
        foreignField: '_id',
        as: lookupTable,
      },
    },
    // return entity with result
    {
      $project: {
        entity: {
          $arrayElemAt: [`$${lookupTable}`, 0],
        },
        count: 1,
      },
    },
    // reverse sort
    {
      $sort: {
        count: -1,
        'entity.name': 1,
      },
    }
  );
  return pipeline;
}

const yearsPipeline = [
  {
    $project: {
      year: {
        $year: {
          $toDate: '$date',
        },
      },
    },
  },
  {
    $group: {
      _id: '$year',
    },
  },
  {
    $project: {
      _id: 0,
      year: '$_id',
    },
  },
  {
    $sort: {
      year: -1,
    },
  },
];

export default async function createViews(db: Db) {
  try {
    await db.createCollection('showArtistStats', {
      viewOn: 'show',
      pipeline: createPipeline('artist'),
    });
    await db.createCollection('showVenueStats', {
      viewOn: 'show',
      pipeline: createPipeline('venue'),
    });
    await db.createCollection('showYears', {
      viewOn: 'show',
      pipeline: [...yearsPipeline],
    });
    await db.createCollection('historyYears', {
      viewOn: 'show',
      pipeline: [
        {
          $match: {
            attended: true,
          },
        },
        ...yearsPipeline,
      ],
    });
  } catch (_) {}
}

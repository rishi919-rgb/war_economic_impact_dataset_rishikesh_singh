import mongoose from 'mongoose';
import { CONFLICT_TYPES, CONFLICT_STATUSES, BLACK_MARKET_LEVELS } from '../constants/index.js';

const conflictSchema = new mongoose.Schema(
  {
    // ==========================================
    // 1. Identity & Timeline Metadata
    // ==========================================
    conflictName: {
      type: String,
      required: [true, 'Conflict name is required.'],
      trim: true,
    },
    conflictType: {
      type: String,
      required: [true, 'Conflict type is required.'],
      trim: true,
      enum: {
        values: CONFLICT_TYPES,
        message: '{VALUE} is not a valid conflict type.',
      },
    },
    region: {
      type: String,
      required: [true, 'Region is required.'],
      trim: true,
    },
    startYear: {
      type: Number,
      required: [true, 'Start year is required.'],
      min: [0, 'Start year cannot be negative.'],
    },
    endYear: {
      type: Number,
      required: [true, 'End year is required.'],
      min: [0, 'End year cannot be negative.'],
    },
    status: {
      type: String,
      required: [true, 'Status is required.'],
      trim: true,
      enum: {
        values: CONFLICT_STATUSES,
        message: '{VALUE} is not a valid status.',
      },
    },
    primaryCountry: {
      type: String,
      required: [true, 'Primary country is required.'],
      trim: true,
    },

    // ==========================================
    // 2. Unemployment Metrics
    // ==========================================
    preWarUnemployment: {
      type: Number,
      min: [0, 'Unemployment rate cannot be negative.'],
    },
    duringWarUnemployment: {
      type: Number,
      min: [0, 'Unemployment rate cannot be negative.'],
    },
    unemploymentSpike: {
      type: Number,
      min: [0, 'Unemployment spike cannot be negative.'],
    },
    mostAffectedSector: {
      type: String,
      trim: true,
    },
    youthUnemploymentChange: {
      type: Number,
      min: [0, 'Youth unemployment change cannot be negative.'],
    },

    // ==========================================
    // 3. Poverty & Food Insecurity
    // ==========================================
    preWarPovertyRate: {
      type: Number,
      min: [0, 'Poverty rate cannot be negative.'],
    },
    duringWarPovertyRate: {
      type: Number,
      min: [0, 'Poverty rate cannot be negative.'],
    },
    extremePovertyRate: {
      type: Number,
      min: [0, 'Extreme poverty rate cannot be negative.'],
    },
    foodInsecurityRate: {
      type: Number,
      min: [0, 'Food insecurity rate cannot be negative.'],
    },
    householdsFallenIntoPoverty: {
      type: Number,
      min: [0, 'Households estimate cannot be negative.'],
    },

    // ==========================================
    // 4. Macroeconomics & Costs
    // ==========================================
    gdpChange: {
      type: Number,
      required: [true, 'GDP change percent is required.'],
      // No min: 0 restriction since GDP change can be negative (i.e. economic contraction)
    },
    inflationRate: {
      type: Number,
      required: [true, 'Inflation rate is required.'],
      min: [0, 'Inflation rate cannot be negative.'],
    },
    currencyDevaluation: {
      type: Number,
      min: [0, 'Devaluation percentage cannot be negative.'],
    },
    warCostUsd: {
      type: Number,
      required: [true, 'Cost of war in USD is required.'],
      min: [0, 'War cost cannot be negative.'],
    },
    reconstructionCostUsd: {
      type: Number,
      required: [true, 'Estimated reconstruction cost in USD is required.'],
      min: [0, 'Reconstruction cost cannot be negative.'],
    },

    // ==========================================
    // 5. Informal & Black Market Economies
    // ==========================================
    informalEconomyPreWar: {
      type: Number,
      min: [0, 'Informal economy percentage cannot be negative.'],
    },
    informalEconomyDuringWar: {
      type: Number,
      min: [0, 'Informal economy percentage cannot be negative.'],
    },
    blackMarketActivityLevel: {
      type: String,
      trim: true,
      enum: {
        values: BLACK_MARKET_LEVELS,
        message: '{VALUE} is not a valid black market activity level.',
      },
    },
    primaryBlackMarketGoods: {
      type: String,
      trim: true,
    },
    currencyBlackMarketGap: {
      type: Number,
      min: [0, 'Currency black market gap rate cannot be negative.'],
    },
    warProfiteeringDocumented: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Mongoose Index Definitions (Performance tuning)
// ==========================================

// Single-field indexes for fields that are sorted or filtered frequently
conflictSchema.index({ conflictName: 1 });
conflictSchema.index({ region: 1 });
conflictSchema.index({ primaryCountry: 1 });
conflictSchema.index({ status: 1 });
conflictSchema.index({ conflictType: 1 });
conflictSchema.index({ inflationRate: -1 });
conflictSchema.index({ gdpChange: 1 });
conflictSchema.index({ warCostUsd: -1 });

// Full-Text Search compound index for global keyword lookup query optimizations
conflictSchema.index(
  {
    conflictName: 'text',
    conflictType: 'text',
    region: 'text',
    primaryCountry: 'text',
    mostAffectedSector: 'text',
    primaryBlackMarketGoods: 'text',
  },
  {
    name: 'conflict_full_text_search',
    weights: {
      conflictName: 5,
      primaryCountry: 4,
      region: 3,
      conflictType: 2,
    },
  }
);

const Conflict = mongoose.model('Conflict', conflictSchema);
export default Conflict;

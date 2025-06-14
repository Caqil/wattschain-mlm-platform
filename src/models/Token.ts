import { Schema, model, models, Document } from 'mongoose';

export interface IToken extends Document {
  _id: string;
  symbol: string;
  name: string;
  totalSupply: number;
  circulatingSupply: number;
  decimals: number;
  
  // Current Presale Info
  currentPresaleRound: number;
  currentPrice: number;
  
  // Token Economics
  tokenomics: {
    presale: number; // Percentage for presale
    team: number; // Percentage for team
    marketing: number; // Percentage for marketing
    ecosystem: number; // Percentage for ecosystem
    reserve: number; // Percentage for reserve
  };
  
  // Contract Information
  contractAddress?: string;
  network?: string;
  isDeployed: boolean;
  
  // Trading
  isTransferable: boolean;
  tradingStartDate?: Date;
  
  // Metadata
  description?: string;
  website?: string;
  whitepaper?: string;
  logo?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const TokenSchema = new Schema<IToken>({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  totalSupply: {
    type: Number,
    required: true,
    min: 0
  },
  circulatingSupply: {
    type: Number,
    required: true,
    min: 0
  },
  decimals: {
    type: Number,
    required: true,
    default: 18
  },
  
  // Current Presale Info
  currentPresaleRound: {
    type: Number,
    required: true,
    default: 1
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Token Economics
  tokenomics: {
    presale: { type: Number, required: true, min: 0, max: 100 },
    team: { type: Number, required: true, min: 0, max: 100 },
    marketing: { type: Number, required: true, min: 0, max: 100 },
    ecosystem: { type: Number, required: true, min: 0, max: 100 },
    reserve: { type: Number, required: true, min: 0, max: 100 }
  },
  
  // Contract Information
  contractAddress: {
    type: String
  },
  network: {
    type: String
  },
  isDeployed: {
    type: Boolean,
    default: false
  },
  
  // Trading
  isTransferable: {
    type: Boolean,
    default: false
  },
  tradingStartDate: {
    type: Date
  },
  
  // Metadata
  description: {
    type: String
  },
  website: {
    type: String
  },
  whitepaper: {
    type: String
  },
  logo: {
    type: String
  }
}, {
  timestamps: true
});

// Validate tokenomics percentages sum to 100
TokenSchema.pre('save', function(next) {
  const total = this.tokenomics.presale + this.tokenomics.team + 
                this.tokenomics.marketing + this.tokenomics.ecosystem + 
                this.tokenomics.reserve;
  
  if (total !== 100) {
    next(new Error('Tokenomics percentages must sum to 100%'));
  } else {
    next();
  }
});

export const Token = models.Token || model<IToken>('Token', TokenSchema);

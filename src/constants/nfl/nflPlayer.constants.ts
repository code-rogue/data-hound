import { DataTypes } from 'sequelize';

export const playerModelName = 'Player';
export const playerModel = {
  id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
  },
  career_status: {
      type: DataTypes.STRING(3),
  },
  game_status_abbr: {
      type: DataTypes.STRING(8),
  },
  game_status: {
      type: DataTypes.STRING(8),
  },
  esb_id: {
      type: DataTypes.STRING(16),
  },
  gsis_id: {
      type: DataTypes.STRING(16),
  },
  gsis_it_id: {
      type: DataTypes.STRING(16),
  },
  smart_id: {
      type: DataTypes.STRING(64),
  },
  full_name: {
      type: DataTypes.STRING(128),
      allowNull: false,
  },
  first_name: {
      type: DataTypes.STRING(64),
      allowNull: false,
  },
  last_name: {
      type: DataTypes.STRING(64),
      allowNull: false,
  },
  short_name: {
      type: DataTypes.STRING(128),
  },
  suffix: {
      type: DataTypes.STRING(8),
  },
}
export const playerModelConfig = {
    schema: 'nfl',
    tableName: 'players',
    timestamps: true,
}

export const playerBioModelName = 'PlayerBio';
export const playerBioModel = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    player_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        /*references: {
            model: Player,
            key: 'id',
        },*/
    },
    birth_date: {
        type: DataTypes.DATEONLY,
    },
    college: {
        type: DataTypes.STRING(64),
    },
    college_conference: {
        type: DataTypes.STRING(64),
    },
    height: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    weight: {
        type: DataTypes.INTEGER,
    },
    headshot_url: {
        type: DataTypes.STRING(512),
    },
}
export const playerBioModelConfig = {
    schema: 'nfl',
    tableName: 'player_bio',
    timestamps: true,
}

export const playerLeagueModelName = 'PlayerLeagueData';
export const playerLeagueModel = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    player_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        /*references: {
            model: Player,
            key: 'id',
        },*/
    },
    position_group: {
        type: DataTypes.STRING(16),
    },
    position: {
        type: DataTypes.STRING(16),
    },
    jersey_number: {
        type: DataTypes.INTEGER,
    },
    years_of_experience: {
        type: DataTypes.INTEGER,
    },
    team: {
        type: DataTypes.STRING(8),
    },
    team_seq: {
        type: DataTypes.STRING(8),
    },
    team_id: {
        type: DataTypes.STRING(8),
    },
    rookie_year: {
        type: DataTypes.STRING(4),
    },
    draft_team: {
        type: DataTypes.STRING(8),
    },
    draft_number: {
        type: DataTypes.STRING(4),
    },
    draft_round: {
        type: DataTypes.STRING(4),
    },
    season: {
        type: DataTypes.STRING(4),
    },
}
export const playerLeagueModelConfig = {
    schema: 'nfl',
    tableName: 'player_league',
}
"""
Blaze Intelligence - Unreal Engine MCP Configuration
Sports visualization and championship rendering configuration
"""

import os
from pathlib import Path

class BlazeConfig:
    """Configuration for Blaze Sports Intelligence Unreal MCP integration"""

    # Server Configuration
    UNREAL_TCP_HOST = "127.0.0.1"
    UNREAL_TCP_PORT = 55557
    MCP_SERVER_PORT = 8765  # WebSocket port for web bridge

    # Blaze Intelligence Branding
    BRAND_COLORS = {
        "burnt_orange": "#BF5700",
        "sec_crimson": "#9E1B32",
        "titans_navy": "#002244",
        "championship_gold": "#FFD700",
        "field_green": "#2D5016",
        "stadium_lights": "#FFF8DC"
    }

    # Championship Teams
    SUPPORTED_TEAMS = {
        "mlb": ["Cardinals", "Yankees", "Dodgers", "Astros"],
        "nfl": ["Titans", "Chiefs", "Bills", "49ers"],
        "nba": ["Grizzlies", "Lakers", "Celtics", "Warriors"],
        "ncaa": ["Longhorns", "Alabama", "Georgia", "Ohio State"]
    }

    # Render Presets
    RENDER_PRESETS = {
        "preview": {
            "resolution": "1920x1080",
            "quality": "medium",
            "antialiasing": "TAA",
            "fps": 30
        },
        "production": {
            "resolution": "3840x2160",
            "quality": "high",
            "antialiasing": "DLSS",
            "fps": 60
        },
        "cinematic": {
            "resolution": "7680x4320",
            "quality": "ultra",
            "antialiasing": "DLSS3",
            "fps": 120,
            "ray_tracing": True,
            "global_illumination": "Lumen"
        }
    }

    # Stadium Environments
    STADIUM_PRESETS = {
        "texas_memorial": {
            "name": "Darrell K Royal Stadium",
            "capacity": 100119,
            "location": "Austin, TX",
            "team": "Longhorns"
        },
        "nissan_stadium": {
            "name": "Nissan Stadium",
            "capacity": 69143,
            "location": "Nashville, TN",
            "team": "Titans"
        },
        "busch_stadium": {
            "name": "Busch Stadium",
            "capacity": 44494,
            "location": "St. Louis, MO",
            "team": "Cardinals"
        },
        "fedex_forum": {
            "name": "FedExForum",
            "capacity": 18119,
            "location": "Memphis, TN",
            "team": "Grizzlies"
        }
    }

    # Animation Templates
    ANIMATION_TEMPLATES = {
        "stadium_flyover": {
            "duration": 15,
            "camera_path": "cinematic_orbit",
            "lighting": "golden_hour"
        },
        "player_intro": {
            "duration": 8,
            "camera_path": "hero_shot",
            "effects": ["smoke", "spotlight", "particles"]
        },
        "scoreboard_update": {
            "duration": 3,
            "transition": "smooth",
            "effects": ["glow", "flash"]
        },
        "championship_celebration": {
            "duration": 30,
            "camera_path": "dynamic",
            "effects": ["confetti", "fireworks", "crowd_simulation"]
        }
    }

    # Data Integration
    DATA_SOURCES = {
        "live_scores": "/api/championship/live",
        "team_stats": "/api/teams/{team_id}/stats",
        "player_data": "/api/players/{player_id}",
        "nil_values": "/api/nil/calculate"
    }

    # Output Settings
    OUTPUT_PATH = Path("./renders")
    CACHE_PATH = Path("./cache/unreal")
    MAX_RENDER_QUEUE = 10
    RENDER_TIMEOUT = 300  # seconds

    # WebSocket Bridge Settings
    WEBSOCKET_CONFIG = {
        "max_connections": 100,
        "heartbeat_interval": 30,
        "reconnect_attempts": 3,
        "message_queue_size": 1000
    }

    @classmethod
    def get_render_settings(cls, preset="production"):
        """Get render settings for specified preset"""
        return cls.RENDER_PRESETS.get(preset, cls.RENDER_PRESETS["production"])

    @classmethod
    def get_stadium_config(cls, stadium_key):
        """Get stadium configuration by key"""
        return cls.STADIUM_PRESETS.get(stadium_key)

    @classmethod
    def ensure_directories(cls):
        """Ensure required directories exist"""
        cls.OUTPUT_PATH.mkdir(parents=True, exist_ok=True)
        cls.CACHE_PATH.mkdir(parents=True, exist_ok=True)

# Initialize directories on import
BlazeConfig.ensure_directories()
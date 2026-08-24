# HeartLink

Mutual relationship status, 3D embossed badges, and role attribution plugin for [Vencord](https://vencord.dev).

## Features

- **Mutual Relationships**: Wife, Husband, Girlfriend, Boyfriend, Best Friend, and Custom roles.
- **3D Embossed Badges**: Rendered in chat headers, member lists, and profile popouts.
- **Discord Clan / Guild Badges**: 41 built-in guild badges.
- **Custom Uploads**: Select local images/GIFs from PC or paste direct links.
- **Interactive Relationship Cards**: Click badges in chat/profiles to see partner info, custom quotes, and connection dates.
- **Real-Time Sync**: REST-based polling synchronization with instant toast notifications.

## Installation

Clone this repository into your Vencord `src/userplugins` directory:

```bash
git clone https://github.com/ahtilol/HeartLink.git src/userplugins/HeartLink
```

Build Vencord:

```bash
pnpm build
```

Restart Discord.

## Settings

Configurable under `Settings -> Plugins -> HeartLink`:
- Toggle badge visibility in chat / member list
- Toggle profile sections and profile badges
- Toggle request notifications
- Toggle user context menu integration

## License

GPL-3.0

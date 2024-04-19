# KinLog

## About

KinLog is a Chrome extension that allows the logging and downloading of chats that you have with your [Kindroid](https://kindroid.ai/) AI (Kin).

## Usage Guide

KinLog will log your chats with your Kindroids (or group chats) as they happen. It cannot reach into your historic chat history, it can only log what it sees when running.

When you wish to download a Kin chat log, click on the extension in Chrome's toobar and click on a file format. Clearing a chat will remove the chat log from your computer forever and cannot be recovered.

Chats are created seperately from each other. Each Kin or group chat will be available as separate downloads.

> [!CAUTION]
> KinLog will only log chats that you have on your Chrome browser. If you continue a conversation on your phone or another device, that part of the conversation will be missing from the downloadable chat log when you return to Chrome.

> [!TIP]
> To create the best chat log start a new Kin or group chat while it is running, then when you have reached a good ending point in the conversation, download the log using the extension, and clear the chat. Your next conversation with that Kin or group will then start with a fresh log.

The managment screen allows you to download and delete chat logs (even from Kins and groups you have deleted in Kindroid.ai as long as they were logged by KinLog originally). It also allows you to quick-switch between Kindroid.ai chats.

### File Options

  * **Text** This will download your chat log in plain text format. Actions will be surrounded with asterisks.

  * **HTML** This will download a HTML version of your chat log. Actions will be surrounded with asterisks and in italics.

  * **JSON** A JSON version of your chat log should you wish to process them in some way using a script or program.

## Compatibility

I can **never** ensure that KinLog will work nicely with other scripts or extensions.

  * **TenPassion's Kindroid Mod Script v1.0** :white_check_mark: Appears to work with KinLog v1.1.
  * **breatfr's Stylus Theme v3.29** :white_check_mark: Appears to work with KinLog v1.1.
  * **breatfr's Violentmonkey Script v1.0** :white_check_mark: Appears to work with KinLog v1.1.

## Known Issues

### KinLog 1.1

> :warning: Giving the same response within the same 10 speech bubbles results in the second response appearing slightly further down the chat log than it should.

**Workaround**: Avoid using the same exact phrase within 10 speech bubbles. For example, don't reply "Sure" to a question, then immediately reply "Sure" to the next. Use a slightly different phrase instead, or use different punctuation, e.g.

`Do you want to go out today?`

`Sure`

`The mall?`

`Sure!`

> :warning: Regenerating a response includes both the original and the regenerated response in the chat log.

There is no current workaround.

## Change Log

The change log can be found [here](https://github.com/JWHorner/KinLog/blob/main/Change%20Log.md).

## FAQ

**Are my chat logs visibile to anyone else?**

> No, they're stored in your Chrome browser. KinLog does not communicate with the internet at all, as demonstrated by it's approval for publishing on the Chrome app store.

**I installed the extension and my chat log only includes the last 10 speech bubbles.**

> KinLog is a web scraper. It can only log what it sees when running. It doesn't have access to your deep chat history. To obtain a full downloadable chat log, make sure the extension is running from the start of the conversation to the end. Do not continue the conversation on your phone or another browser, as KinLog will not be able to see it and that chat will be missing when you download the log.

**Will there be a Firefox version?**

> Maybe. Maybe not. Depends on the demand.

**Will there be an Opera/Safari/Edge version?**

> Probably not.

## Roadmap

  * Handle speech regenerations.

## Contact

Please log any issues or requests on [GitHub](https://github.com/JWHorner/KinLog/issues) or join the KinLog issues/requests channel on [Discord](https://discord.gg/GgYpmhtz).

For anything else message the [KinLog text channel](https://discord.gg/DQha4FVA) on Discord or PM me (Nashwan) from there.

## Disclaimer

KinLog is a third-party extension and is not affiliated with Kindroid.ai in any way. Please use at your own risk.

The author is not responsible for the loss of chat logs created with this extension, not with the loss of any conversation data caused by a software issue or otherwise.
import EventEmitter from 'events';
import appDispatcher from '../dispatcher';

import cons from './cons';

function getSettings() {
  const settings = localStorage.getItem('settings');
  if (settings === null) return null;
  return JSON.parse(settings);
}

function setSettings(key, value) {
  let settings = getSettings();
  if (settings === null) settings = {};
  settings[key] = value;
  localStorage.setItem('settings', JSON.stringify(settings));
}

class Settings extends EventEmitter {
  constructor() {
    super();

    this.themes = ['', 'silver-theme', 'dark-theme', 'butter-theme'];
    this.themeIndex = this.getThemeIndex();

    this.useSystemTheme = this.getUseSystemTheme();
    this.isMarkdown = this.getIsMarkdown();
    this.isGreentext = this.getIsGreentext();
    this.isPeopleDrawer = this.getIsPeopleDrawer();
    this.hideMembershipEvents = this.getHideMembershipEvents();
    this.hideNickAvatarEvents = this.getHideNickAvatarEvents();
    this._showNotifications = this.getShowNotifications();
    this.isNotificationSounds = this.getIsNotificationSounds();
    this.sendTypingNotifications = this.getSendTypingNotifications();
    this.sendReadReceipts = this.getSendReadReceipts();
    this.isTime12 = this.getIsTime12();

    this.isTouchScreenDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
  }

  getThemeIndex() {
    if (typeof this.themeIndex === 'number') return this.themeIndex;

    const settings = getSettings();
    if (settings === null) return 0;
    if (typeof settings.themeIndex === 'undefined') return 0;
    // eslint-disable-next-line radix
    return parseInt(settings.themeIndex);
  }

  getThemeName() {
    return this.themes[this.themeIndex];
  }

  _clearTheme() {
    document.body.classList.remove('system-theme');
    this.themes.forEach((themeName) => {
      if (themeName === '') return;
      document.body.classList.remove(themeName);
    });
  }

  applyTheme() {
    this._clearTheme();
    if (this.useSystemTheme) {
      document.body.classList.add('system-theme');
    } else if (this.themes[this.themeIndex]) {
      document.body.classList.add(this.themes[this.themeIndex]);
    }
  }

  setTheme(themeIndex) {
    this.themeIndex = themeIndex;
    setSettings('themeIndex', this.themeIndex);
    this.applyTheme();
  }

  toggleUseSystemTheme() {
    this.useSystemTheme = !this.useSystemTheme;
    setSettings('useSystemTheme', this.useSystemTheme);
    this.applyTheme();

    this.emit(cons.events.settings.SYSTEM_THEME_TOGGLED, this.useSystemTheme);
  }

  getUseSystemTheme() {
    if (typeof this.useSystemTheme === 'boolean') return this.useSystemTheme;

    const settings = getSettings();
    if (settings === null) return true;
    if (typeof settings.useSystemTheme === 'undefined') return true;
    return settings.useSystemTheme;
  }

  getIsMarkdown() {
    if (typeof this.isMarkdown === 'boolean') return this.isMarkdown;

    const settings = getSettings();
    if (settings === null) return true;
    if (typeof settings.isMarkdown === 'undefined') return true;
    return settings.isMarkdown;
  }

  getIsGreentext() {
    if (typeof this.isGreentext === 'boolean') return this.isGreentext;

    const settings = getSettings();
    if (settings === null) return true;
    if (typeof settings.isGreentext === 'undefined') return true;
    return settings.isGreentext;
  }

  getHideMembershipEvents() {
    if (typeof this.hideMembershipEvents === 'boolean') return this.hideMembershipEvents;

    const settings = getSettings();
    if (settings === null) return false;
    if (typeof settings.hideMembershipEvents === 'undefined') return false;
    return settings.hideMembershipEvents;
  }

  getHideNickAvatarEvents() {
    if (typeof this.hideNickAvatarEvents === 'boolean') return this.hideNickAvatarEvents;

    const settings = getSettings();
    if (settings === null) return true;
    if (typeof settings.hideNickAvatarEvents === 'undefined') return true;
    return settings.hideNickAvatarEvents;
  }

  getIsPeopleDrawer() {
    if (typeof this.isPeopleDrawer === 'boolean') return this.isPeopleDrawer;

    const settings = getSettings();
    if (settings === null) return true;
    if (typeof settings.isPeopleDrawer === 'undefined') return true;
    return settings.isPeopleDrawer;
  }

  get showNotifications() {
    if (window.Notification?.permission !== 'granted') return false;
    return this._showNotifications;
  }

  getShowNotifications() {
    if (typeof this._showNotifications === 'boolean') return this._showNotifications;

    const settings = getSettings();
    if (settings === null) return true;
    if (typeof settings.showNotifications === 'undefined') return true;
    return settings.showNotifications;
  }

  getIsNotificationSounds() {
    if (typeof this.isNotificationSounds === 'boolean') return this.isNotificationSounds;

    const settings = getSettings();
    if (settings === null) return true;
    if (typeof settings.isNotificationSounds === 'undefined') return true;
    return settings.isNotificationSounds;
  }

  getSendTypingNotifications() {
    if (typeof this.sendTypingNotifications === 'boolean') return this.sendTypingNotifications;

    const settings = getSettings();
    if (settings === null) return true;
    if (typeof settings.sendTypingNotifications === 'undefined') return true;
    return settings.sendTypingNotifications;
  }

  getSendReadReceipts() {
    if (typeof this.sendReadReceipts === 'boolean') return this.sendReadReceipts;

    const settings = getSettings();
    if (settings === null) return true;
    if (typeof settings.sendReadReceipts === 'undefined') return true;
    return settings.sendReadReceipts;
  }

  getIsTime12() {
    if (typeof this.isTime12 === 'boolean') return this.isTime12;

    const settings = getSettings();
    if (settings === null) return false;
    if (typeof settings.isTime12 === 'undefined') return false;
    return settings.isTime12;
  }

  setter(action) {
    const actions = {
      [cons.actions.settings.TOGGLE_SYSTEM_THEME]: () => {
        this.toggleUseSystemTheme();
      },
      [cons.actions.settings.TOGGLE_MARKDOWN]: () => {
        this.isMarkdown = !this.isMarkdown;
        setSettings('isMarkdown', this.isMarkdown);
        this.emit(cons.events.settings.MARKDOWN_TOGGLED, this.isMarkdown);
      },
      [cons.actions.settings.TOGGLE_GREENTEXT]: () => {
        this.isGreentext = !this.isGreentext;
        setSettings('isGreentext', this.isGreentext);
        this.emit(cons.events.settings.GREENTEXT_TOGGLED, this.isGreentext);
      },
      [cons.actions.settings.TOGGLE_PEOPLE_DRAWER]: () => {
        this.isPeopleDrawer = !this.isPeopleDrawer;
        setSettings('isPeopleDrawer', this.isPeopleDrawer);
        this.emit(cons.events.settings.PEOPLE_DRAWER_TOGGLED, this.isPeopleDrawer);
      },
      [cons.actions.settings.TOGGLE_MEMBERSHIP_EVENT]: () => {
        this.hideMembershipEvents = !this.hideMembershipEvents;
        setSettings('hideMembershipEvents', this.hideMembershipEvents);
        this.emit(cons.events.settings.MEMBERSHIP_EVENTS_TOGGLED, this.hideMembershipEvents);
      },
      [cons.actions.settings.TOGGLE_NICKAVATAR_EVENT]: () => {
        this.hideNickAvatarEvents = !this.hideNickAvatarEvents;
        setSettings('hideNickAvatarEvents', this.hideNickAvatarEvents);
        this.emit(cons.events.settings.NICKAVATAR_EVENTS_TOGGLED, this.hideNickAvatarEvents);
      },
      [cons.actions.settings.TOGGLE_NOTIFICATIONS]: async () => {
        if (window.Notification?.permission !== 'granted') {
          this._showNotifications = false;
        } else {
          this._showNotifications = !this._showNotifications;
        }
        setSettings('showNotifications', this._showNotifications);
        this.emit(cons.events.settings.NOTIFICATIONS_TOGGLED, this._showNotifications);
      },
      [cons.actions.settings.TOGGLE_NOTIFICATION_SOUNDS]: () => {
        this.isNotificationSounds = !this.isNotificationSounds;
        setSettings('isNotificationSounds', this.isNotificationSounds);
        this.emit(cons.events.settings.NOTIFICATION_SOUNDS_TOGGLED, this.isNotificationSounds);
      },
      [cons.actions.settings.TOGGLE_TYPING_NOTIFICATIONS]: () => {
        this.sendTypingNotifications = !this.sendTypingNotifications;
        setSettings('sendTypingNotifications', this.sendTypingNotifications);
        this.emit(cons.events.settings.TYPING_NOTIFICATIONS_TOGGLED, this.sendTypingNotifications);
      },
      [cons.actions.settings.TOGGLE_READ_RECEIPTS]: () => {
        this.sendReadReceipts = !this.sendReadReceipts;
        setSettings('sendReadReceipts', this.sendReadReceipts);
        this.emit(cons.events.settings.READ_RECEIPTS_TOGGLED, this.sendReadReceipts);
      },
      [cons.actions.settings.TOGGLE_TIME12]: () => {
        this.isTime12 = !this.isTime12;
        setSettings('isTime12', this.isTime12);
        this.emit(cons.events.settings.TIME12_TOGGLED, this.isTime12);
      },
    };

    actions[action.type]?.();
  }
}

const settings = new Settings();
appDispatcher.register(settings.setter.bind(settings));

export default settings;

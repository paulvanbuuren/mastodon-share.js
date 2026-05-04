# a Share-on-Mastodon button that remembers your instance
A modification of a share-on-mastodon link that remembers your server instance.

Inspiration from [github.com/codepo8/mastodon-share](https://github.com/codepo8/mastodon-share).

## status: First draft.

The idea of this share button is that you enter a Mastodon instance before you can share a link. The instance is saved to local storage. Every subsequent visit to the website reads the instance from local storage and thus makes sharing easier.

## Demo 
Demo image from a local website. Set an instance and edit it.

<img width="826" height="600" alt="share-on-mastodon" src="https://github.com/user-attachments/assets/4816bc78-fecd-47ba-9e41-24721aec9f54" />

---

## User Story: Mastodon Share Button (`[mastodon_share]`)

### Overview

As a visitor to a multilingual website, I want to share the current page to Mastodon, so that I can post it to my Mastodon instance without having to manually copy the URL.

### Baseline Behaviour (No JavaScript / No Local Storage)

**As a visitor with JavaScript disabled or local storage unavailable,**
I want the share button to still function as a basic link,
so that I can share the page even in a degraded environment.

**Acceptance criteria:**
- `[mastodon_share]` renders as an `<a>` element.
- The `href` points to the official Mastodon share endpoint, with a query string parameter `text` containing the share text and the page URL.
- Translation strings are sourced from the text object in the source code, matching the active site language.
- If JavaScript is unavailable, or local storage is not writable, no further enhancement is applied — the element remains a plain anchor link.

### Progressive Enhancement: check for local storage and JavaScript

**As the page loads,**
The script evaluates whether enhanced behaviour can be activated.

**Acceptance criteria:**
- The script detects whether JavaScript is available and executable.
- The script detects whether values can be written to local storage.
- If either check fails, no enhancement is applied; the baseline anchor behaviour is preserved.
- If both checks pass:
  - If **no** Mastodon instance is found in local storage → apply **Situation 1** behaviour.
  - If a Mastodon instance **is** found in local storage → apply **Situation 2** behaviour.

---

### Situation 1: First Use — Set the Mastodon Instance

**As a first-time visitor clicking the share button,**
I want to be prompted to enter my Mastodon instance URL,
so that my share is routed to the correct server.

#### Trigger
- An `onclick` handler is attached to `[mastodon_share]`.
- Clicking `[mastodon_share]` opens a `<dialog>` element instead of following the link.

#### Dialog Contents
- A text input field `[mastodon_instanceurl]` for entering the Mastodon instance URL.
- A checkbox `[mastodon_permission_to_store]` with the label sourced from the text object (e.g. *"Store my instance in my browser"*).

#### On Submit (valid URL entered)
**Acceptance criteria:**
- The dialog closes.
- If `[mastodon_instanceurl]` contains a valid URL **and** `[mastodon_permission_to_store]` is checked, the instance URL is saved to local storage.
- The browser opens the share URL in a new tab using `window.open(url, '_blank', 'noopener,noreferrer')`.
- The `href` attribute of `[mastodon_share]` is updated to the share endpoint of `[mastodon_instanceurl]`, with query string `text` set to the title of the shared page.

#### Closing the Dialog Without Submitting
**Acceptance criteria:**
- The dialog can be closed via a clearly labelled *"Close"* button (label sourced from the text object).
- The dialog can also be closed by clicking outside the dialog element.
- Closing without submitting does **not** alter any stored value and does **not** update the `href`.


### Situation 2: Returning Use — Known Instance + Edit Option

**As a returning visitor with a saved Mastodon instance,**
I want the share button to go directly to my instance,
and I want to be able to change my instance if needed,
so that I don't have to re-enter it every time, but retain control over it.

#### On Page Load
**Acceptance criteria:**
- The `href` of `[mastodon_share]` is updated to the share endpoint of the stored `[mastodon_instanceurl]`, with query string `text` set to the title of the shared page.
- An additional *"Edit my instance"* button (label sourced from the text object) is inserted in the DOM directly after `[mastodon_share]`.

#### Edit Dialog
- Clicking *"Edit my instance"* opens the same `<dialog>` element.
- The dialog pre-populates `[mastodon_instanceurl]` with the currently stored value.
- `[mastodon_permission_to_store]` is pre-checked (since a stored value exists).
- The user may change the URL, clear the URL field, or uncheck `[mastodon_permission_to_store]`.

#### On Submit
**Acceptance criteria:**
- If `[mastodon_permission_to_store]` is **unchecked**: all values are removed from local storage.
- If `[mastodon_permission_to_store]` is **checked** and the URL field value has changed:
  - If the field is **empty**: the local storage value is **not** updated (invalid state; empty value is not saved).
  - If the field contains a **valid URL**: the new URL is saved to local storage and the `href` is updated accordingly.
  - If the field contains an **invalid URL**: no update is made to local storage or the `href`.
- No data is changed if the user closes the dialog without clicking submit.

#### Closing the Dialog Without Submitting
**Acceptance criteria:**
- Same as Situation 1: close button or outside click dismisses the dialog.
- No values are altered.

### Cross-Cutting Concerns

| Concern | Requirement |
|---|---|
| **Multilingual support** | All visible strings (button labels, dialog labels, checkbox label, close button) are sourced from the text object; no hardcoded strings in the script. |
| **Validation** | A URL is considered valid if it passes standard URL validation (e.g. parseable by the `URL` constructor without throwing). |
| **Accessibility** | The `<dialog>` element should be focusable and closeable via keyboard (Escape key closes it). Labels must be properly associated with their inputs. |
| **Security** | All new-tab navigation uses `noopener,noreferrer` to prevent tab-napping. |
| **No framework dependency** | The script uses plain JavaScript; no external libraries are required. |

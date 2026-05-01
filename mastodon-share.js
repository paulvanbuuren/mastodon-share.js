// This script sets the URL for a Mastodon share button.
// For this we need:
// - the user's mastodon instance
// - the option to store that instance in their browser memory via localstorage
// - a share button
//  Code inspired by https://github.com/codepo8/mastodon-share
//

// Initialize variables
let localstorage_key = null;
let mastoserver_url = null;
let dialog_object = null;
let dialog_inputfield = null;

// This is the anchor object that will contain the mastodon URL
let mastodon_share_anchor = document.querySelector('.mastodon-share');

const get_localstorage_value = (mastodon_sharebutton_key) => {
    // some people do not want anything stored in their browser memory.
    // That prevents us from setting any

    try {
        mastoserver_url = localStorage.getItem(mastodon_sharebutton_key);
        if ((mastoserver_url === null) || (mastoserver_url === 'null') || (mastoserver_url === '')) {
            return '';
        } else {
            return mastoserver_url;
        }

    } catch (e) {
        // fallback for when localStorage not supported: log and remove the button
        if (mastodon_share_anchor) {
            console.log('localstorage not supported. Mastodon share button is removed.');
            mastodon_share_anchor.remove();
            mastodon_share_anchor = null;
        }
    }
    return false;

}

// refresh the link with the mastoserver_url name
const refreshlink = (mastoserver_url) => {
    let mastoserver_url_cleaned = '';
    let via_text = '';


    const mastodon_share_visuallyhidden = document.querySelectorAll(".mastodon-share span.visuallyhidden");

    if ((mastoserver_url === null) || (mastoserver_url === 'null') || (mastoserver_url === '')) {
        mastodon_share_visuallyhidden[0].innerHTML = mastodon_sharebutton.linktext_share_uninitialized;
        mastodon_share_anchor.href = `#`;
        mastodon_share_anchor.removeAttribute('onclick');
        mastodon_share_anchor.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem(localstorage_key);
            open_the_dialog();
        });
    } else {
        mastoserver_url_cleaned = mastoserver_url;
        mastoserver_url_cleaned = mastoserver_url_cleaned.replace("http://", "");
        mastoserver_url_cleaned = mastoserver_url_cleaned.replace("https://", "");
        if (mastodon_sharebutton.via) {
            via_text = 'via ' + mastodon_sharebutton.via;
        }

        mastodon_share_visuallyhidden[0].innerHTML = mastodon_sharebutton.linktext_share_initialized;
        mastodon_share_anchor.href = `https://${mastoserver_url_cleaned}/share?text=${encodeURIComponent(document.title)}%0A${encodeURIComponent(location.href)}%0A${encodeURIComponent(via_text)}`;
    }

    return false;
}

const remove_editbutton = _ => {
    // remove the edit button

    if (mastodon_sharebutton.mastodon_edit_button_id) {

        let edit_button = document.getElementById(mastodon_sharebutton.mastodon_edit_button_id);

        if (edit_button !== null) {
            edit_button.remove();
        }
    }

}


if (typeof mastodon_sharebutton === 'object') {
    // There is an object that helps us determine the key and dialog object

    // What is the key for local storage?
    if (mastodon_sharebutton.key) {
        localstorage_key = mastodon_sharebutton.key;
        mastoserver_url = get_localstorage_value(localstorage_key).toString();
    }

    // What is our dialog object?
    if (mastodon_sharebutton.mastodon_dialog_id) {
        dialog_object = document.getElementById(mastodon_sharebutton.mastodon_dialog_id);
        dialog_inputfield = document.getElementById(mastodon_sharebutton.dialog_inputfield);
    }

}

// Ask the user for the mastoserver_url name and set it…
const open_the_dialog = _ => {
    let initial_instance = '';

    if ((mastoserver_url === null) || (mastoserver_url === 'null')) {
        initial_instance = '';
    } else {
        initial_instance = mastoserver_url;
    }

    dialog_inputfield.value = initial_instance;
    dialog_object.showModal();
}


// there is a mastodon share button, let's go!
if ((mastodon_share_anchor) && (typeof mastodon_sharebutton !== 'undefined')) {

    // labels and texts from the link
    let editlabel = mastodon_sharebutton.editlabel;
    let button_cancel = document.getElementById(mastodon_sharebutton.mastodon_dialog_cancel_id);
    let button_save = document.getElementById(mastodon_sharebutton.mastodon_dialog_save_id);

    // create and insert the edit link
    const createeditbutton = _ => {

        if (document.querySelector('button.mastodon-edit')) {
            return;
        }
        if ((mastoserver_url === null) || (mastoserver_url === 'null')) {
            // remove the edit button
            document.getElementById(mastodon_sharebutton.mastodon_edit_button_id).remove();
            return;
        }


        let editlink = document.createElement('button');
        editlink.innerHTML = '<span class="implicit">&nbsp;</span><span class="explicit">' + editlabel + '</span>';
        editlink.classList.add('mastodon-edit');
        editlink.ariaLabel = editlabel;
        editlink.setAttribute('id', mastodon_sharebutton.mastodon_edit_button_id);
        editlink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem(localstorage_key);
            open_the_dialog();
        });
        mastodon_share_anchor.insertAdjacentElement('afterend', editlink);
    }

    // if there is  a value in localstorage, create the edit link
    let check_for_key = get_localstorage_value(localstorage_key);
    if (check_for_key) {
        createeditbutton();
    }

    // When a user clicks the link
    mastodon_share_anchor.addEventListener('click', (e) => {
        let storedValue = get_localstorage_value(localstorage_key);


        if (mastodon_share_anchor.href === '#') {
            // this is initial state of the share button

            if (!storedValue) {
                // can't read the localstorage
            } else if ((storedValue === null) || (storedValue === 'null') || (storedValue === '')) {
                // otherwise, prompt the user for their instance and save it to localstorage
                e.preventDefault();
                open_the_dialog();

            } else {
                // If the user has already entered their instance
                // and it is in localstorage, then write out the link href
                // with the instance and the current page title and URL
                refreshlink(storedValue);
            }
        }

    });


    window.addEventListener("load", (event) => {
        let storedValue = get_localstorage_value(localstorage_key);
        if (storedValue) {
            // If the user has already entered their instance,
            // and it is in localstorage write out the link href
            // with the instance and the current page title and URL
            refreshlink(storedValue);
        } else {
            // nothing yet in storage for localstorage_key
            mastodon_share_anchor.href = `#`;
            mastodon_share_anchor.removeAttribute('onclick');
            mastodon_share_anchor.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem(localstorage_key);
                open_the_dialog();
            });

        }
    });

    button_save.addEventListener('click', (e) => {
        dialog_object.close('save');
    });

    button_cancel.addEventListener('click', (e) => {
        dialog_object.close('cancel');
    });


    if (null === dialog_object) {
        // there is no dialog element
    } else {

        dialog_object.addEventListener("close", (e) => {

            if (dialog_object.returnValue === 'cancel') {
                // cancel: keep existing value
                localStorage.setItem(localstorage_key, mastoserver_url);
                dialog_object.close(dialog_object.returnValue);

            } else if ((dialog_object.returnValue === 'save') && (dialog_inputfield.value.length)) {
                // save: User clicked save and input field is not empty
                mastoserver_url = dialog_inputfield.value;
                dialog_object.returnValue = mastoserver_url;
                localStorage.setItem(localstorage_key, mastoserver_url);
                createeditbutton();
                refreshlink(mastoserver_url);
                dialog_object.close(mastoserver_url);

                if ( mastodon_share_anchor.href !== '#') {
                    // make feedback explicit: make the share link visible
                    const mastodon_share_visuallyhidden = document.querySelectorAll(".mastodon-share span.visuallyhidden");
                    mastodon_share_visuallyhidden[0].innerHTML = mastodon_sharebutton.linktext_share_initialized;
                    mastodon_share_visuallyhidden[0].className = 'updated';
                    // The href is set to a proper URL, open it in a new browser tab.
                    window.open(mastodon_share_anchor.href, "_blank", "noopener,noreferrer");
                }

            } else {
                // clean: make sure the stored value is cleaned
                mastoserver_url = ''
                localStorage.setItem(localstorage_key, mastoserver_url);
                remove_editbutton();
                refreshlink(mastoserver_url);
                dialog_object.close();
            }
            // focus back to share link
            if (mastodon_share_anchor) {
                mastodon_share_anchor.focus();
            }

        });
    }


}
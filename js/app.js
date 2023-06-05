/* Template Name: Landrick - Saas & Software Landing Page Template
   Author: Shreethemes
   E-mail: support@shreethemes.in
   Created: August 2019
   Version: 4.2.0
   Updated: March 2022
   File Description: Main JS file of the template
*/


/*********************************/
/*         INDEX                 */
/*================================
 *     01.  Loader               *
 *     02.  Toggle Menus         *
 *     03.  Active Menu          *
 *     04.  Clickable Menu       *
 *     05.  Back to top          *
 *     06.  Feather icon         *
 *     06.  DD Menu              *
 *     06.  Active Sidebar Menu  *
 ================================*/


// Cookie helper
function getCookie(name) {
    if (localStorage.getItem(name) != null) {
        return localStorage.getItem(name);
    }

    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    
    return null;
}

function isLoggedIn() {
    return getCookie("token") != null;
}

function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
    }

    document.cookie = "ps_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    if (localStorage.getItem('ps_token')) {
        localStorage.removeItem('ps_token');
    }

    window.location.href = 'https://ezfn.dev';
}

// Request EZFN, so we can setup errors for the whole page
async function EZFNRequest(path, data, method) {
    var response = await fetch(`https://v2.ezfn.dev${path}`, {
        method: method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'same-origin',
        body: JSON.stringify(data)
    });
    
    return await response.json();
}

// auth - force the user to login so he can use EZFN
function AccountNeeded() {
    window.location.href = `https://ezfn.dev/login/?redirect=${window.location.href}`;
}

// hCaptcha
function gethCaptchaResponseKey() {
    var res = document.getElementsByName('h-captcha-response');
    if (res.length == 1) {
        var key = document.getElementsByName('h-captcha-response')[0].value;
        if (key == "") {
            return null;
        }

        return key;
    }

    return null;
}

// Notify - Error - Success
/* Notify */
function notify(message, icon, time, type) {
    return $.notify({
        icon: icon,
        message: message
    }, {
        z_index: Math.max.apply(null, $.map($('body *'), function (e, n) {
            if ($(e).css('position') != 'static') return parseInt($(e).css('z-index')) || 1;
        })),
        type: type,
        time: time,
        placement: {
            from: "top",
            align: "center"
        }
    });
}

function notify_error(message, icon, time = 3500) {
    return notify(message, icon, time, 'danger')
}

function notify_success(message, icon, time = 3500) {
    return notify(message, icon, time, 'success')
}

// Navigation

async function isLauncherOpened() {
    try {
        var result = await new Promise(function(resolve, reject) {
            $.ajax({
                url: 'http://127.0.0.1:60101/ezfnlauncher/status',
                type: 'POST',
                dataType: "json",
                timeout: 1000,
                beforeSend: function() {            
                },
                success: function(data) {
                    resolve(data) // Resolve promise and when success
                },
                error: function(err) {
                    reject(err) // Reject the promise and go to catch()
                }
            });
        });

        if (result.status == "success") {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}

async function NavigateToLauncherPressed() {
    window.location.href = 'https://ezfn.dev/launcher';
    return;

    if(document.getElementById('preloader')) {
        document.getElementById('preloader').style = null;
    } else {
        document.getElementsByTagName("body")[0].innerHTML += `<div id="preloader">
            <div id="status">
                <div class="spinner">
                    <div class="double-bounce1"></div>
                    <div class="double-bounce2"></div>
                </div>
            </div>
        </div>`;
    }

    // Check if the launcher is open, otherwise open the download popup
    var launcherOpened = await isLauncherOpened();

    document.getElementById('preloader').style.visibility = 'hidden';
    document.getElementById('preloader').style.opacity = '0';

    if (launcherOpened) {
        window.location.href = 'https://ezfn.dev/launcher';
    } else {
        var link = document.createElement('a');
        document.body.appendChild(link);
        link.setAttribute('data-bs-toggle', 'modal');
        link.setAttribute('data-bs-target', '#download-ezfn-modal');
        link.click();

        pageFinishedLoading();
    }
}

function NavigateToAccountSettingsPressed() {
    if (getCookie('token')) {
        window.location.href = 'https://ezfn.dev/account';
    } else {
        window.location.href = 'https://ezfn.dev/login';
    }
}

// window.addEventListener('load',   fn , false )
function pageFinishedLoading() {
    if(document.getElementById('preloader')) {
        document.getElementById('preloader').style.visibility = 'hidden';
        document.getElementById('preloader').style.opacity = '0';
    }
}

//  window.onload = function loader() {
function fn() {
    // Preloader
    if(document.getElementById('preloader')){
        setTimeout(() => {
            document.getElementById('preloader').style.visibility = 'hidden';
            document.getElementById('preloader').style.opacity = '0';
        }, 350);
    }
    // Menus
    activateMenu();
}

//Menu
// Toggle menu
function toggleMenu() {
    document.getElementById('isToggle').classList.toggle('open');
    var isOpen = document.getElementById('navigation')
    if (isOpen.style.display === "block") {
        isOpen.style.display = "none";
    } else {
        isOpen.style.display = "block";
    }
};

//Menu Active
function getClosest(elem, selector) {

    // Element.matches() polyfill
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function (s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) { }
                return i > -1;
            };
    }

    // Get the closest matching element
    for (; elem && elem !== document; elem = elem.parentNode) {
        if (elem.matches(selector)) return elem;
    }
    return null;

};

function activateMenu() {
    var menuItems = document.getElementsByClassName("sub-menu-item");
    if (menuItems) {

        var matchingMenuItem = null;
        for (var idx = 0; idx < menuItems.length; idx++) {
            if (menuItems[idx].href === window.location.href) {
                matchingMenuItem = menuItems[idx];
            }
        }

        if (matchingMenuItem) {
            matchingMenuItem.classList.add('active');
            var immediateParent = getClosest(matchingMenuItem, 'li');
            if (immediateParent) {
                immediateParent.classList.add('active');
            }

            var parent = getClosest(matchingMenuItem, '.parent-menu-item');
            if (parent) {
                parent.classList.add('active');
                var parentMenuitem = parent.querySelector('.menu-item');
                if (parentMenuitem) {
                    parentMenuitem.classList.add('active');
                }
                var parentOfParent = getClosest(parent, '.parent-parent-menu-item');
                if (parentOfParent) {
                    parentOfParent.classList.add('active');
                }
            } else {
                var parentOfParent = getClosest(matchingMenuItem, '.parent-parent-menu-item');
                if (parentOfParent) {
                    parentOfParent.classList.add('active');
                }
            }
        }
    }
}

window.addEventListener('resize', windowResized, false);
function windowResized() {
    if (document.getElementById('discord-invite-li')) {
        // Remove discord button if it's too big
        var win = window,
        doc = document,
        docElem = doc.documentElement,
        body = doc.getElementsByTagName('body')[0],
        windowWidth = win.innerWidth || docElem.clientWidth || body.clientWidth;

        if (windowWidth < 450)
            document.getElementById('discord-invite-li').innerHTML = '';
        else
            document.getElementById('discord-invite-li').innerHTML = `
            <a href="https://discord.com/invite/7SY3qNBKyD" target="_blank" class="btn btn-soft-primary ms-1">
                <i class="fab fa-discord"></i>
            </a>`;
    }
}

// Clickable Menu
if(document.getElementById("navigation")){
    if (document.getElementById('discord-invite-li')) {
        // Remove discord button if it's too big
        var win = window,
        doc = document,
        docElem = doc.documentElement,
        body = doc.getElementsByTagName('body')[0],
        windowWidth = win.innerWidth || docElem.clientWidth || body.clientWidth;

        if (windowWidth < 450)
            document.getElementById('discord-invite-li').innerHTML = '';
    }

    var elements = document.getElementById("navigation").getElementsByTagName("a");
    for(var i = 0, len = elements.length; i < len; i++) {
        if (elements[i].onclick == null) {
            elements[i].onclick = function (elem) {
                if(elem.target.getAttribute("href") === "javascript:void(0)") {
                    var submenu = elem.target.nextElementSibling.nextElementSibling;
                    submenu.classList.toggle('open');
                }
            }
        }
    }
}

// Menu sticky
function windowScroll() {
    const navbar = document.getElementById("topnav");
    if(navbar!=null){
        if (
            document.body.scrollTop >= 50 ||
            document.documentElement.scrollTop >= 50
        ) {
            navbar.classList.add("nav-sticky");
        } else {
            navbar.classList.remove("nav-sticky");
        }
    }
}

window.addEventListener('scroll', (ev) => {
    ev.preventDefault();
    windowScroll();
})

// back-to-top
var mybutton = document.getElementById("back-to-top");
window.onscroll = function () {
    scrollFunction();
};

function scrollFunction() {
    if(mybutton!=null){
        if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
            mybutton.style.display = "block";
        } else {
            mybutton.style.display = "none";
        }
    }
}

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// change-to-darkmode
function changeTheme() {
    if (
        document.getElementsByClassName('theme-opt')[1].href == "https://ezfn.dev/assets/css/style.min.css"
    ) {
        setTheme('style-dark');
        localStorage.setItem('theme', 'style-dark');
    } else {
        setTheme('style-light');
        localStorage.setItem('theme', 'style-light');
    }
}

// Active Sidebar
(function () {
    var current = location.pathname.substring(location.pathname.lastIndexOf('/') + 1);;
    if (current === "") return;
    var menuItems = document.querySelectorAll('.sidebar-nav a');
    for (var i = 0, len = menuItems.length; i < len; i++) {
        if (menuItems[i].getAttribute("href").indexOf(current) !== -1) {
            menuItems[i].parentElement.className += " active";
        }
    }
})();

// Feather icon
feather.replace();

// dd-menu
var ddmenu = document.getElementsByClassName("dd-menu");
for(var i = 0, len = ddmenu.length; i < len; i++) {
    ddmenu[i].onclick = function (elem) {
        elem.stopPropagation();
    }
}

// Tooltip
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
});

// Popovers
var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
})

// Small menu
try {
    var spy = new Gumshoe('#navmenu-nav a');
}catch(err) {
    
}
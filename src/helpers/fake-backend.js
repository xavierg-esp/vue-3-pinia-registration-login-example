export { fakeBackend };
import axios from 'axios';
// array in local storage for registered users
const usersKey = 'vue-3-pinia-registration-login-example-users';
let users = JSON.parse(localStorage.getItem(usersKey)) || [];

function fakeBackend() {
    let realFetch = window.fetch;
    window.fetch = function (url, opts) {
        return new Promise((resolve, reject) => {
            // wrap in timeout to simulate server api call
            setTimeout(handleRoute, 500);

            function handleRoute() {
                switch (true) {
                    case url.endsWith('/users/authenticate') && opts.method === 'POST':
                        return authenticate();
                    case url.endsWith('/users/register') && opts.method === 'POST':
                        return register();
                    case url.endsWith('/users') && opts.method === 'GET':
                        return getUsers();
                    case url.match(/\/users\/\d+$/) && opts.method === 'GET':
                        return getUserById();
                    case url.match(/\/users\/\d+$/) && opts.method === 'PUT':
                        return updateUser();
                    case url.match(/\/users\/\d+$/) && opts.method === 'DELETE':
                        return deleteUser();
                    default:
                        // pass through any requests not handled above
                        return realFetch(url, opts)
                            .then(response => resolve(response))
                            .catch(error => reject(error));
                }
            }

            // route functions

            async function authenticate() {


                const { username, password } = body();

                const url = 'https://tstdrv2789974.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=853&deploy=1&compid=TSTDRV2789974&h=4fb90b6b6a0bf48563c6'; // Replace with your API endpoint

                const postData = {
                username,
                password,
                postAction: 'validateLoginData',
                };

                await axios.post(url, postData)
                .then((response) => {
                    // Handle the response
                    console.log('Response:' + JSON.stringify(response.data));
                    console.log('Response Base:' + JSON.stringify(response));
                    const parseJson = response.data;
                    // Check the response for authentication success
                    if (parseJson.success) {
                        // Authentication successful
                        return ok(
                            parseJson
                        );
                    } else {
                        // Authentication failed
                        return error('Username or password is incorrect');
                    }
                })
                .catch((error) => {
                    // Handle any errors
                    console.error('An error occurred:', error);
                });

                // const user = users.find(x => x.username === username && x.password === password);

                // if (!user) return error('Username or password is incorrect');

                // return ok({
                //     ...basicDetails(user),
                //     token: 'fake-jwt-token'
                // });
            }

            function register() {
                const user = body();

                if (users.find(x => x.username === user.username)) {
                    return error('Username "' + user.username + '" is already taken')
                }

                user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
                users.push(user);
                localStorage.setItem(usersKey, JSON.stringify(users));
                return ok();
            }

            function getUsers() {
                if (!isAuthenticated()) return unauthorized();
                return ok(users.map(x => basicDetails(x)));
            }

            function getUserById() {
                if (!isAuthenticated()) return unauthorized();

                const user = users.find(x => x.id === idFromUrl());
                return ok(basicDetails(user));
            }

            function updateUser() {
                if (!isAuthenticated()) return unauthorized();

                let params = body();
                let user = users.find(x => x.id === idFromUrl());

                // only update password if entered
                if (!params.password) {
                    delete params.password;
                }

                // if username changed check if taken
                if (params.username !== user.username && users.find(x => x.username === params.username)) {
                    return error('Username "' + params.username + '" is already taken')
                }

                // update and save user
                Object.assign(user, params);
                localStorage.setItem(usersKey, JSON.stringify(users));

                return ok();
            }

            function deleteUser() {
                if (!isAuthenticated()) return unauthorized();

                users = users.filter(x => x.id !== idFromUrl());
                localStorage.setItem(usersKey, JSON.stringify(users));
                return ok();
            }

            // helper functions

            function ok(body) {
                resolve({ ok: true, ...headers(), json: () => Promise.resolve(body) })
            }

            function unauthorized() {
                resolve({ status: 401, ...headers(), json: () => Promise.resolve({ message: 'Unauthorized' }) })
            }

            function error(message) {
                resolve({ status: 400, ...headers(), json: () => Promise.resolve({ message }) })
            }

            function basicDetails(user) {
                const { id, username, firstName, lastName } = user;
                return { id, username, firstName, lastName };
            }

            function isAuthenticated() {
                // return opts.headers['Authorization'] === 'Bearer fake-jwt-token';
                return opts.headers['Authorization'] === 'Bearer RandomGeneratedKey';
            }

            function body() {
                return opts.body && JSON.parse(opts.body);
            }

            function idFromUrl() {
                const urlParts = url.split('/');
                return parseInt(urlParts[urlParts.length - 1]);
            }

            function headers() {
                return {
                    headers: {
                        get(key) {
                            return ['application/json'];
                        }
                    }
                }
            }
        });
    }
}

import { useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { forEach, includes, capitalize } from 'lodash';

/*eslint no-useless-escape: 0*/
const TITLES = {
  '/accounts/login': 'Sign In - OCL',
  '/accounts/signup': 'Sign Up - OCL',
  '/accounts/password/reset': 'Password Reset - OCL',
  "/accounts/([a-zA-Z0-9\-\.\_\@]+)/password/reset/([a-zA-Z0-9\-\.\_\@]+)": "Change Password - OCL",
  "/accounts/([a-zA-Z0-9\-\.\_\@]+)/verify/([a-zA-Z0-9\-\.\_\@]+)": "Verify Email - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)": "$1 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)": "$1 - $2 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)": "$1 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/collections/([a-zA-Z0-9\-\.\_\@]+)": "$3 / $1 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/collections/([a-zA-Z0-9\-\.\_\@]+)": "$3 / $1 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/collections/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)": "$4 / $2 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/collections/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)" : "$4 / $2 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)": "$3 / $1 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)": "$3 / $1 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)": "$1 - $4 / $2 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)": "$1 - $4 / $2- OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/mappings/([a-zA-Z0-9\-\.\_\@]+)":"$6 / $4 / $3 / $1 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/mappings/([a-zA-Z0-9\-\.\_\@]+)":"$5 / $3 / $1 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/mappings/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$6 / $4 / $2 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/mappings/([a-zA-Z0-9\-\.\_\@]+)":"$5 / $3 / $1 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/mappings/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$6 / $4 / $2 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/mappings/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$7 / $5 / $4 / $2 / $1 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/mappings/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$1 - $8 / $6 / $5 / $3 / $2 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/mappings/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$7 / $5 / $4 / $2 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/mappings/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$1 - $8 / $6 / $5 / $3 / $2 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/mappings/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$1 - $7 / $5 / $3 / $2 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/mappings/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$1 - $7 / $5 / $3 / $2 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/concepts/([a-zA-Z0-9\-\.\_\@]+)":"$6 / $4 / $3 / $1 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/concepts/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$6 / $4 / $3 / $1 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/concepts/([a-zA-Z0-9\-\.\_\@]+)":"$6 / $4 / $3 / $1 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/concepts/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$6 / $4 / $3 / $1 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/concepts/([a-zA-Z0-9\-\.\_\@]+)":"$5 / $3 / $1 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/concepts/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$6 / $4 / $2 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/concepts/([a-zA-Z0-9\-\.\_\@]+)":"$5 / $3 / $1 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/concepts/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$6 / $4 / $2 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/concepts/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$1 - $8 / $6 / $5 / $3 / $2 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/concepts/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$7 / $5 / $4 / $2 / $1 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/concepts/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$1 - $8 / $6 / $5 / $3 / $2 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/concepts/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$1 - $7 / $5 / $3 / $2 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/concepts/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$1 - $7 / $5 / $3 / $2 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$5 / $3 / $2 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/sources/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)":"$5 / $3 / $2 - OCL",
  "/orgs/([a-zA-Z0-9\-\.\_\@]+)/collections/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)" : "$5 / $3 / $2 - OCL",
  "/users/([a-zA-Z0-9\-\.\_\@]+)/collections/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)/([a-zA-Z0-9\-\.\_\@]+)" : "$5 / $3 / $2 - OCL",
  "/([a-zA-Z0-9\-\.\_\@]+)/compare":"Compare - $2 - OCL",
  "/imports":"Imports - OCL",
  "/search":"Search - OCL"
}


export default function DocumentTitle() {
    const { pathname } = useLocation();
    const capitalWords = ['concepts', 'mappings', 'versions', 'details', 'history', 'sources', 'collections', 'orgs', 'references', 'about']
    useEffect(() => {
        forEach(TITLES, (title, routeName) => {
            if(new RegExp(routeName).test(pathname)) {
                const keywords = pathname.split("/").filter(ele => ele).reverse()
                keywords.forEach((keyword, index) => {
                    if(includes(capitalWords, keyword)) {
                        keyword = capitalize(keyword)
                    }
                    title = title.replace(`$${index+1}`, keyword)
                })
                document.title = title
            }
        })

        return () => document.title = 'OCL'
    }, [pathname]);

  return null;
  }

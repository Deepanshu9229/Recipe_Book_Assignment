import {Link} from 'react-router-dom';

function NavBar(){
    return(
        <nav>
            <Link to="/" className='bg-orange-300 font-bold text-white p-4 flex justify-between'>Recipe Book</Link>
        </nav>
    )
}
export default NavBar
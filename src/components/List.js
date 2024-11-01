import {useLayoutEffect, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPen, faPlus, faTrash} from '@fortawesome/free-solid-svg-icons';

axios.defaults.baseURL = 'http://localhost:3000/book';
export const List = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTerm2, setSearchTerm2] = useState("");
    const dialogRef = useRef(null);
    const [selectedElement, setSelectedElement] = useState(null);
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [listCategory, setListCategory] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const fetch = async () => {
        try {
            const response = await axios.get("", {
                params: {
                    _sort: "quantity",
                    name_like: searchTerm
                }
            });
            setList(response.data);
            const response2 = await axios.get("http://localhost:3000/category");
            setListCategory(response2.data);
        } catch (error) {
            console.error('Lỗi xảy ra:', error);
        }
    }
    useLayoutEffect(() => {
        fetch();
    }, [isDeleting, searchTerm]);
    const notifySuccess = (content) => {
        toast.success(content, {
            position: "top-right",
            autoClose: 3000
        });
    }
    const filteredList = list?.filter(item =>
        item.category?.name.toLowerCase().includes(searchTerm2.toLowerCase())
    ) || [];
    const openDialog = (item) => {
        setSelectedElement(item);
        dialogRef.current?.showModal();
    }
    const closeDialog = () => {
        setSelectedElement(null);
        dialogRef.current?.close();
    }
    const handleDeleteUser = async () => {
        if (selectedElement !== null) {
            setIsDeleting(true);
            try {
                await axios.delete("/" + selectedElement.id);
                notifySuccess("Xóa thành công");
                closeDialog();
            } catch (error) {
                console.error('Lỗi khi xóa:', error);
            } finally {
                setIsDeleting(false);
            }
        } else {
            console.warn("Không có sách nào được chọn để xóa.");
        }
    }
    const handleEditUser = (item) => {
        setSelectedElement(item);
        navigate("/add", {state: {item: {...item}}});
    }
    return (
        <div className="container d-flex flex-column align-items-center justify-content-center">
            <dialog ref={dialogRef} className="dialog" style={{
                borderRadius: "10px",
                padding: '20px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                backgroundColor: '#f8f9fa'
            }}>
                <h2 className="text-center mb-4">Xác nhận xóa</h2>
                <p className="text-center">Bạn có chắc chắn muốn xóa
                    sách <strong>{selectedElement?.name}</strong> không?</p>
                <div className="col d-flex justify-content-end px-1 mt-3">
                    <button className="btn btn-danger btn-sm mx-2" onClick={handleDeleteUser} disabled={isDeleting}>
                        {isDeleting ? 'Đang xóa...' : 'Xóa'}
                    </button>
                    <button className="btn btn-secondary btn-sm mx-2" onClick={closeDialog}>Hủy</button>
                </div>
            </dialog>
            <input
                type="text"
                placeholder="Tìm kiếm theo tên..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{marginBottom: '20px', padding: '8px', width: '100%'}}
            />
            <select style={{marginBottom: '20px', padding: '8px', width: '100%'}} value={searchTerm2}
                    onChange={e => setSearchTerm2(e.target.value)}>
                <option value={""}>"Tìm kiếm theo thể loại..."</option>
                {listCategory.map(category => (<option value={category.name}>{category.name}</option>))}
            </select>
            {filteredList.length === 0 ? (<h1>Không có thông tin sách này</h1>) : (
                <table>
                    <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Quantity</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredList.sort((a, b) => b.quantity - a.quantity).map(item => (
                        <tr key={item.id}>
                            <td>{item.code}</td>
                            <td>{item.name}</td>
                            <td>{item.category?.name}</td>
                            <td>{item.date}</td>
                            <td>{item.quantity}</td>
                            <td>
                                <button className="btn btn-secondary btn-sm mx-1" onClick={() => handleEditUser(item)}>
                                    <FontAwesomeIcon icon={faPen}/>
                                </button>
                                <button className="btn btn-danger btn-sm mx-1" onClick={() => openDialog(item)}>
                                    <FontAwesomeIcon icon={faTrash}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>)}
            <Link to={"/add"} className="btn bg-body-secondary my-3"><FontAwesomeIcon icon={faPlus}/></Link>
        </div>
    );
}
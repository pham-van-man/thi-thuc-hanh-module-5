import {useLocation, useNavigate} from "react-router-dom";
import * as Yup from "yup";
import {toast} from "react-toastify";
import {ErrorMessage, Field, Form, Formik} from "formik";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";
import {useLayoutEffect, useState} from "react";
import {faFloppyDisk} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

axios.defaults.baseURL = 'http://localhost:3000/book';
export const Add = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const item = location.state?.item || {code: "", name: "", category: "", date: "", quantity: ""};
    const [list, setList] = useState([]);
    const validationSchema = Yup.object().shape({
        code: Yup.string()
            .required("Mã sách không được để trống")
            .matches(/^BO-[0-9]{4}$/, "Mã sách không đúng định dạng BO-XXXX"),
        name: Yup.string()
            .required("Tên sách không được để trống")
            .max(100, "Tối đa 100 kí tự"),
        category: Yup.mixed().required("Vui lòng chọn thể loại"),
        date: Yup.string()
            .required("Ngày nhập không được để trống")
            .matches(
                /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
                "Ngày không đúng định dạng dd/mm/yyyy"
            )
            .test("is-future-date", "Ngày nhập không được lớn hơn ngày hiện tại", function (value) {
                if (!value) return false;
                const [day, month, year] = value.split("/").map(Number);
                const inputDate = new Date(year, month - 1, day);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return inputDate <= today;
            }),
        quantity: Yup.number()
            .typeError("Số lượng không đúng định dạng")
            .integer("Số lượng phải là số nguyên")
            .moreThan(0, "Số lượng phải lớn hơn 0")
            .required("Số lượng không được để trống")
    });
    const notifySuccess = (content) => {
        toast.success(content, {
            position: "top-right",
            autoClose: 3000
        });
    }
    useLayoutEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axios.get("http://localhost:3000/category");
                setList(response.data);
            } catch (error) {
                console.error('Lỗi xảy ra:', error);
            }
        }
        fetchCountries();
    }, []);
    return (
        <Formik
            initialValues={{...item, category: item.category ? JSON.stringify(item.category) : ""}}
            validateOnMount={true}
            validationSchema={validationSchema}
            onSubmit={async (values, {setSubmitting}) => {
                const selectedCategory = JSON.parse(values.category);
                let fetch;
                if (item.id == null) {
                    fetch = async () => {
                        await axios.post("", {
                            ...values,
                            category: selectedCategory
                        });
                    };
                } else {
                    fetch = async () => {
                        await axios.put("/" + item.id, {
                            ...values,
                            id: item.id,
                            category: selectedCategory
                        });
                    };
                }
                await fetch();
                setSubmitting(false);
                navigate("/", {replace: true});
                notifySuccess("Lưu thành công!");
            }}
        >
            {({isSubmitting, isValid}) => (
                <Form
                    style={{
                        marginBottom: '20px',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                    className={"container d-flex flex-column align-items-center justify-content-center bg-light"}
                >
                    <h3 className="mb-4">{item.id ? "Chỉnh sửa" : "Thêm mới"}</h3>
                    <div className="w-100 mb-3">
                        <Field name="code" placeholder="Mã sách" className="form-control"/>
                        <ErrorMessage name={"code"}>
                            {msg => <div style={{color: 'red'}}>{msg}</div>}
                        </ErrorMessage>
                    </div>
                    <div className="w-100 mb-3">
                        <Field name="name" placeholder="Tên sách" className="form-control"/>
                        <ErrorMessage name={"name"}>
                            {msg => <div style={{color: 'red'}}>{msg}</div>}
                        </ErrorMessage>
                    </div>
                    <div className="w-100 mb-3">
                        <Field as="select" name="category" className="form-control">
                            <option value="">Chọn thể loại...</option>
                            {list.map(category => (
                                <option key={category.id} value={JSON.stringify(category)}>{category.name}</option>
                            ))}
                        </Field>
                        <ErrorMessage name={"category"}>
                            {msg => <div style={{color: 'red'}}>{msg}</div>}
                        </ErrorMessage>
                    </div>
                    <div className="w-100 mb-3">
                        <Field name="date" placeholder="Ngày nhập" className="form-control"/>
                        <ErrorMessage name={"date"}>
                            {msg => <div style={{color: 'red'}}>{msg}</div>}
                        </ErrorMessage>
                    </div>
                    <div className="w-100 mb-3">
                        <Field name="quantity" placeholder="Số lượng" className="form-control"/>
                        <ErrorMessage name={"quantity"}>
                            {msg => <div style={{color: 'red'}}>{msg}</div>}
                        </ErrorMessage>
                    </div>

                    <button type="submit" className="btn btn-success mt-2" disabled={!isValid || isSubmitting}>
                        <FontAwesomeIcon icon={faFloppyDisk}/>
                    </button>
                    {isSubmitting && <h5>Đang lưu...</h5>}
                </Form>
            )}
        </Formik>
    );
}

import axios from "axios";
import { enqueueSnackbar } from "notistack";
import React, { Fragment, useEffect, useState } from "react";

function Sidebar({ setActiveMenu }) {
  return (
    <div className="w-1/4 bg-gradient-to-b from-green-500 to-green-700 text-white p-6 min-h-screen shadow-2xl rounded-r-3xl">
      <h2 className="text-3xl font-extrabold mb-8 text-center">Menu</h2>
      <ul className="space-y-4">
        <li
          className="py-3 px-4 cursor-pointer bg-green-600 hover:bg-green-800 rounded-xl text-lg text-center shadow-md"
          onClick={() => setActiveMenu("dashboard")}
        >
          Quản lý
        </li>
      </ul>
    </div>
  );
}


function Dashboard() {
  const baseUrl = "https://apicheckmomo.onrender.com";
  const [data, setData] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [phoneCount, setphoneCount] = useState([]);
  const [savedPhones, setSavedPhones] = useState([]); // LƯU CÁC SỐ ĐÃ GỬI
  const [fromDate, setFromDate] = useState(""); // Ngày bắt đầu
  const [toDate, setToDate] = useState("");
  const runSubmission = async () => {
    await handleSubmit(); // Gọi hàm submit ban đầu
    setTimeout(runSubmission, 5000); // Lặp lại sau 5 giây
  };
  const handleSubmit = async () => {
    const phonesArray = phoneNumbers
      .split("\n")
      .map((phone) => phone.trim())
      .filter((phone) => phone);

    const uniquePhones = [...new Set([...savedPhones, ...phonesArray])];

    setSavedPhones(uniquePhones); // CẬP NHẬT DANH SÁCH SỐ ĐÃ GỬI
    setphoneCount(uniquePhones); // CẬP NHẬT HIỂN THỊ

    for (let i = 0; i < uniquePhones.length; i++) {
      try {
        const response = await axios.post(`${baseUrl}/get-history`, {
          phone: [uniquePhones[i]],
          fromDate: fromDate,
          toDate: toDate,
        });

        console.log("Phản hồi từ server:", response.data.result_paylater);

        setData((prevData) => {
          const updatedData = [...prevData];
          const existingIndex = updatedData.findIndex(
            (item) => item.phone === uniquePhones[i]
          );

          if (existingIndex !== -1) {
            // Cập nhật dữ liệu nếu đã tồn tại
            updatedData[existingIndex] = {
              ...updatedData[existingIndex],
              ...response.data.result_paylater[0],
            };
          } else {
            // Thêm mới nếu chưa có
            updatedData.push(...response.data.result_paylater);
          }

          return updatedData;
        });

        enqueueSnackbar(
          `Số ${uniquePhones[i]} xử lý thành công! - số tiền: ${response.data.result_paylater[0].totalMoney}`,
          {
            variant: "success",
          }
        );
      } catch (error) {
        console.error(`Lỗi khi xử lý số ${uniquePhones[i]}:`, error);
        enqueueSnackbar(`Gửi thất bại cho số ${uniquePhones[i]}!`, {
          variant: "error",
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 2300));
    }

    setPhoneNumbers(""); 
  };

  const handleDisablePaylayter = async (phone) => {
    try {
      const response = await axios.post(`${baseUrl}/paylater-disable`, {
        phone: phone,
      });
      console.log("Phản hồi từ server:", response.data);
      enqueueSnackbar("Lấy dữ liệu thành công! " + response.data.status, {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar(
        `Gửi thất bại! ${
          error.response.data.status || error.response.statusText
        }`,
        { variant: "error" }
      );
    }
  };
  return (
    <div className="bg-white shadow-2xl rounded-3xl p-10 w-full border border-green-300">
      <h1 className="text-4xl font-extrabold text-center text-green-600 mb-8">
        Kiểm tra ví
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-3">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              className="w-full p-4 border border-green-400 rounded-xl focus:ring-4 focus:ring-green-500 focus:outline-none bg-green-50"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-3">
              Ngày kết thúc
            </label>
            <input
              type="date"
              className="w-full p-4 border border-green-400 rounded-xl focus:ring-4 focus:ring-green-500 focus:outline-none bg-green-50"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Điện thoại
          </label>
          <textarea
            className="w-full p-4 border border-green-400 rounded-xl focus:ring-4 focus:ring-green-500 focus:outline-none bg-green-50"
            rows="6"
            placeholder="Nhập số điện thoại, cách nhau bằng dấu phẩy..."
            value={phoneNumbers}
            onChange={(e) => setPhoneNumbers(e.target.value)}
          ></textarea>
        </div>
        {/* <div>
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Mật khẩu
          </label>
          <input
            type="text"
            className="w-full p-4 border border-green-400 rounded-xl focus:ring-4 focus:ring-green-500 focus:outline-none bg-green-50"
            placeholder="Nhập mật khẩu"
          />
        </div> */}
      </div>
      <span className="text-[20px]">
        Đã thêm <span className="text-[red]">{phoneCount.length}</span> số điện
        thoại
      </span>

      <button
        className="mt-6 w-full bg-green-500 text-white py-3 rounded-2xl hover:bg-green-600 transition-all text-lg shadow-lg"
        onClick={runSubmission}
      >
        Xác nhận
      </button>
      <div className="mt-10 overflow-x-auto">
        <table className="w-full border-collapse border border-green-400 shadow-lg rounded-xl">
          <thead className="bg-green-500 text-white">
            <tr>
              <th className="py-3 px-4">STT</th>
              <th className="py-3 px-4">Số điện thoại</th>
              <th className="py-3 px-4">Tên Shop</th>
              <th className="py-3 px-4">Tổng tiền</th>
              <th className="py-3 px-4">Paylayter</th>
              <th className="py-3 px-4">% trả sau</th>
              <th className="py-3 px-4">Tiền treo</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4">Khóa ví</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="odd:bg-green-50 even:bg-green-100">
                <td className="py-3 px-4 text-center">{index + 1}</td>
                <td className="py-3 px-4">{item.phone}</td>
                <td className="py-3 px-4">{item.shop}</td>
                <td className="py-3 px-4 text-center">
                  {item.totalMoney == null
                    ? "0"
                    : item.totalMoney.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                </td>
                <td className="py-3 px-4">
                  {item.paylater ? "Chưa khóa" : "Đã khóa"}
                </td>
                <td className="py-3 px-4">
                  {Math.ceil(item.totalMoney / 1000000)} %
                </td>
                <td className="py-3 px-4">{item.pendingMoney}</td>
                <td className="py-3 px-4">{item.status}</td>

                <td className="py-3 px-4 text-center ">
                  {item.paylater ? (
                    <button
                      onClick={() => handleDisablePaylayter(item.phone)}
                      className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                    >
                      Khóa ví trả sau
                    </button>
                  ) : (
                    "—" // Hoặc có thể để trống nếu muốn
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const baseUrl = "https://apicheckmomo.onrender.com";
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async () => {
    try {
      const response_login = await axios.post(`${baseUrl}/login`, {
        email: email,
        password: password,
      });

      if (response_login.status === 200) {
        setIsLoggedIn(true);
        enqueueSnackbar(response_login.data.message, {
          variant: "success",
        });
      }
    } catch (error) {
      if (error.response) {
        enqueueSnackbar(error.response.data.error, {
          variant: "error",
        });
      } else {
        enqueueSnackbar("Lỗi không xác định. Vui lòng thử lại sau.", {
          variant: "error",
        });
      }
    }
  };

  return (
    <div>
      <div className="flex min-h-screen bg-gradient-to-br from-green-100 to-green-200">
        <Sidebar setActiveMenu={setActiveMenu} />
        <div className="flex w-3/4 p-8">
          {activeMenu === "dashboard" && <Dashboard />}
          {/* {activeMenu === "paylater" && <Paylayter />} */}
        </div>
      </div>
    </div>
  );
}

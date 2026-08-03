import axiosInstance from "./axiosInstance";

export function getReport(yearMonth){
    return axiosInstance.get(`/reports/${yearMonth}`)
}
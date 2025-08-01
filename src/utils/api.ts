// utils/api.ts
import axios, { AxiosRequestConfig } from 'axios';

export const get = (url: string, config: AxiosRequestConfig = {}) => axios.get(url, config);
export const post = (url: string, data?: unknown, config: AxiosRequestConfig = {}) => axios.post(url, data, config);
export const put = (url: string, data?: unknown, config: AxiosRequestConfig = {}) => axios.put(url, data, config);
export const del = (url: string, config: AxiosRequestConfig = {}) => axios.delete(url, config);

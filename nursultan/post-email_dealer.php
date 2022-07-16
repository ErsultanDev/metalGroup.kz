<?php

if (!$_POST) exit('No direct script access allowed');

if (!isset($_POST['f'])) exit('No direct script access allowed');
if (!isset($_POST['f']['name'])) exit('No direct script access allowed');
if (!isset($_POST['f']['email'])) exit('No direct script access allowed');
if (!isset($_POST['f']['phone'])) exit('No direct script access allowed');
if (!isset($_POST['f']['mes'])) exit('No direct script access allowed');
$email = trim(strip_tags($_POST['f']['email']));
$name = trim(strip_tags($_POST['f']['name']));
$phone = trim(strip_tags($_POST['f']['phone']));
$mes = trim(strip_tags($_POST['f']['mes']));

if (!filter_var($email, FILTER_VALIDATE_EMAIL))
{
	exit('Неверный E-mail. Пожалуйста укажите правильный адрес');
}

if (!$name)
{
	exit('Пожалуйста заполните поле "ФИО"');
}
if (!$phone)
{
	exit('Пожалуйста заполните поле "Номер телефона"');
}
if (!$mes)
{
	exit('Пожалуйста заполните поле "Компания"');
}

$to = 'dealer.metalgroup@gmail.com'; // адрес получателя

$subject = 'Заявка на дилерство'; // тема письма

// формируем тело сообщения
$message = 'Имя: ' . $name . "\r\n" . 'Email: ' . $email . "\r\n" . 'Телефон: ' . $phone . "\r\n" . 'Сообщение: ' . $mes; 

// формируем headers для письма
$headers = 'From: Metalgroup.kz <zakaz@metalgroup.kz>'; // от кого
 
// кодируем заголовок в UTF-8
$subject = preg_replace("/(\r\n)|(\r)|(\n)/", "", $subject);
$subject = preg_replace("/(\t)/", " ", $subject);
$subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
	
// отправка
@mail($to, $subject, $message, $headers);

echo 'Спасибо, ваше сообщение отправлено!';

# end of file
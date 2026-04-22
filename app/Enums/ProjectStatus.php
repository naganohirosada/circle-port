<?php

namespace App\Enums;

enum ProjectStatus: int
{
    case DRAFT = 10;
    case ACTIVE = 20;
    case SUCCESS = 30;
    case CLOSED = 40;
    case CANCELLED = 50;
}